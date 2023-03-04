import { Comment, CommentDisplayPart, Reflection } from "../../models";
import type { Logger, ValidationOptions } from "../../utils";
import { DeclarationReference } from "./declarationReference";
export type ExternalResolveResult = {
    target: string;
    caption?: string;
};
export type ExternalSymbolResolver = (ref: DeclarationReference, refl: Reflection, part: Readonly<CommentDisplayPart> | undefined) => ExternalResolveResult | string | undefined;
export declare function resolveLinks(comment: Comment, reflection: Reflection, validation: ValidationOptions, logger: Logger, externalResolver: ExternalSymbolResolver): void;
export declare function resolvePartLinks(reflection: Reflection, parts: readonly CommentDisplayPart[], warn: () => void, validation: ValidationOptions, logger: Logger, externalResolver: ExternalSymbolResolver): CommentDisplayPart[];
