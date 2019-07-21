"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OBJFile = /** @class */ (function () {
    function OBJFile(fileContents, defaultModelName) {
        this.defaultModelName = 'untitled';
        this.currentMaterial = '';
        this.currentGroup = '';
        this.smoothingGroup = 0;
        this.result = {
            materialLibraries: [],
            models: [],
        };
        this.fileContents = fileContents;
        if (defaultModelName !== undefined) {
            this.defaultModelName = defaultModelName;
        }
    }
    OBJFile.prototype.parseAsync = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                resolve(_this.parse());
            }
            catch (theError) {
                reject(theError);
            }
        });
    };
    OBJFile.prototype.parse = function () {
        var stripComments = function (line) {
            var commentIndex = line.indexOf('#');
            if (commentIndex > -1) {
                return line.substring(0, commentIndex);
            }
            return line;
        };
        var lines = this.fileContents.split('\n');
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            var strippedline = stripComments(line);
            var lineItems = strippedline
                .replace(/\s\s+/g, ' ')
                .trim()
                .split(' ');
            switch (lineItems[0].toLowerCase()) {
                case 'o': // Start A New Model
                    this.parseObject(lineItems);
                    break;
                case 'g': // Start a new polygon group
                    this.parseGroup(lineItems);
                    break;
                case 'v': // Define a vertex for the current model
                    this.parseVertexCoords(lineItems);
                    break;
                case 'vt': // Texture Coords
                    this.parseTextureCoords(lineItems);
                    break;
                case 'vn': // Define a vertex normal for the current model
                    this.parseVertexNormal(lineItems);
                    break;
                case 's': // Smooth shading statement
                    this.parseSmoothShadingStatement(lineItems);
                    break;
                case 'f': // Define a Face/Polygon
                    this.parsePolygon(lineItems);
                    break;
                case 'mtllib': // Reference to a material library file (.mtl)
                    this.parseMtlLib(lineItems);
                    break;
                case 'usemtl': // Sets the current material to be applied to polygons defined from this point forward
                    this.parseUseMtl(lineItems);
                    break;
            }
        }
        return this.result;
    };
    OBJFile.prototype.currentModel = function () {
        if (this.result.models.length === 0) {
            this.result.models.push({
                faces: [],
                name: this.defaultModelName,
                textureCoords: [],
                vertexNormals: [],
                vertices: [],
            });
            this.currentGroup = '';
            this.smoothingGroup = 0;
        }
        return this.result.models[this.result.models.length - 1];
    };
    OBJFile.prototype.parseObject = function (lineItems) {
        var modelName = lineItems.length >= 2 ? lineItems[1] : this.defaultModelName;
        this.result.models.push({
            faces: [],
            name: modelName,
            textureCoords: [],
            vertexNormals: [],
            vertices: [],
        });
        this.currentGroup = '';
        this.smoothingGroup = 0;
    };
    OBJFile.prototype.parseGroup = function (lineItems) {
        if (lineItems.length !== 2) {
            throw 'Group statements must have exactly 1 argument (eg. g group_1)';
        }
        this.currentGroup = lineItems[1];
    };
    OBJFile.prototype.parseVertexCoords = function (lineItems) {
        var x = lineItems.length >= 2 ? parseFloat(lineItems[1]) : 0.0;
        var y = lineItems.length >= 3 ? parseFloat(lineItems[2]) : 0.0;
        var z = lineItems.length >= 4 ? parseFloat(lineItems[3]) : 0.0;
        this.currentModel().vertices.push({ x: x, y: y, z: z });
    };
    OBJFile.prototype.parseTextureCoords = function (lineItems) {
        var u = lineItems.length >= 2 ? parseFloat(lineItems[1]) : 0.0;
        var v = lineItems.length >= 3 ? parseFloat(lineItems[2]) : 0.0;
        var w = lineItems.length >= 4 ? parseFloat(lineItems[3]) : 0.0;
        this.currentModel().textureCoords.push({ u: u, v: v, w: w });
    };
    OBJFile.prototype.parseVertexNormal = function (lineItems) {
        var x = lineItems.length >= 2 ? parseFloat(lineItems[1]) : 0.0;
        var y = lineItems.length >= 3 ? parseFloat(lineItems[2]) : 0.0;
        var z = lineItems.length >= 4 ? parseFloat(lineItems[3]) : 0.0;
        this.currentModel().vertexNormals.push({ x: x, y: y, z: z });
    };
    OBJFile.prototype.parsePolygon = function (lineItems) {
        var totalVertices = lineItems.length - 1;
        if (totalVertices < 3) {
            throw "Face statement has less than 3 vertices";
        }
        var face = {
            group: this.currentGroup,
            material: this.currentMaterial,
            smoothingGroup: this.smoothingGroup,
            vertices: [],
        };
        for (var i = 0; i < totalVertices; i += 1) {
            var vertexString = lineItems[i + 1];
            var vertexValues = vertexString.split('/');
            if (vertexValues.length < 1 || vertexValues.length > 3) {
                throw "Two many values (separated by /) for a single vertex";
            }
            var vertexIndex = 0;
            var textureCoordsIndex = 0;
            var vertexNormalIndex = 0;
            vertexIndex = parseInt(vertexValues[0], 10);
            if (vertexValues.length > 1 && vertexValues[1] !== '') {
                textureCoordsIndex = parseInt(vertexValues[1], 10);
            }
            if (vertexValues.length > 2) {
                vertexNormalIndex = parseInt(vertexValues[2], 10);
            }
            if (vertexIndex === 0) {
                throw 'Faces uses invalid vertex index of 0';
            }
            // Negative vertex indices refer to the nth last defined vertex
            // convert these to postive indices for simplicity
            if (vertexIndex < 0) {
                vertexIndex = this.currentModel().vertices.length + 1 + vertexIndex;
            }
            face.vertices.push({
                textureCoordsIndex: textureCoordsIndex,
                vertexIndex: vertexIndex,
                vertexNormalIndex: vertexNormalIndex,
            });
        }
        this.currentModel().faces.push(face);
    };
    OBJFile.prototype.parseMtlLib = function (lineItems) {
        if (lineItems.length >= 2) {
            this.result.materialLibraries.push(lineItems[1]);
        }
    };
    OBJFile.prototype.parseUseMtl = function (lineItems) {
        if (lineItems.length >= 2) {
            this.currentMaterial = lineItems[1];
        }
    };
    OBJFile.prototype.parseSmoothShadingStatement = function (lineItems) {
        if (lineItems.length !== 2) {
            throw 'Smoothing group statements must have exactly 1 argument (eg. s <number|off>)';
        }
        var groupNumber = lineItems[1].toLowerCase() === 'off' ? 0 : parseInt(lineItems[1], 10);
        this.smoothingGroup = groupNumber;
    };
    return OBJFile;
}());
exports.default = OBJFile;
