export default class OBJFile {
    result: IResult;
    private fileContents;
    private defaultModelName;
    private currentMaterial;
    private currentGroup;
    private smoothingGroup;
    constructor(fileContents: string, defaultModelName?: string);
    parseAsync(): Promise<IResult>;
    parse(): IResult;
    private currentModel;
    private parseObject;
    private parseGroup;
    private parseVertexCoords;
    private parseTextureCoords;
    private parseVertexNormal;
    private parsePolygon;
    private parseMtlLib;
    private parseUseMtl;
    private parseSmoothShadingStatement;
}
export interface IResult {
    models: IModel[];
    materialLibraries: string[];
}
export interface IModel {
    name: string;
    vertices: IVertex[];
    textureCoords: ITextureVertex[];
    vertexNormals: IVertex[];
    faces: IFace[];
}
export interface IFace {
    material: string;
    group: string;
    smoothingGroup: number;
    vertices: IFaceVertexIndicies[];
}
export interface IFaceVertexIndicies {
    vertexIndex: number;
    textureCoordsIndex: number;
    vertexNormalIndex: number;
}
export interface IVertex {
    x: number;
    y: number;
    z: number;
}
export interface ITextureVertex {
    u: number;
    v: number;
    w: number;
}
