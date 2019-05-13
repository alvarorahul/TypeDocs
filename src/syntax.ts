export = Main;

module Main {
    "use strict";

    /**
     * Defines the type of element.
     */
    export const enum SyntaxKind {
        Unknown = 0,
        Parameter = 139,
        PropertySignature = 141,
        PropertyDeclaration = 142,
        MethodSignature = 143,
        MethodDeclaration = 144,
        VariableDeclaration = 214,
        FunctionDeclaration = 216,
        ClassDeclaration = 217,
        InterfaceDeclaration = 218,
        TypeAliasDeclaration = 219,
        EnumDeclaration = 220,
        ModuleDeclaration = 221,
        HeritageClause = 246,
        EnumMember = 250,
    }

    /**
     * Defines attributes common to all elements.
     */
    export interface Element {
        /**
         * The name of the element.
         */
        name?: string;

        /**
         * The documentation of the element.
         */
        documentation?: string;

        /**
         * The kind of element.
         */
        kind: SyntaxKind;
    }

    /**
     * Defines an element that's a container for other elements.
     */
    export interface ContainerElement<T extends Element> extends Element {
        /**
         * The child members of this element.
         */
        members: T[];
    }

    /**
     * Defines a heritage clause.
     */
    export interface HeritageClause extends Element {
        /**
         * The types being inherited or implemented.
         */
        types: Type[];
    }

    /**
     * Defines an element type that can be generic.
     */
    export interface Generic extends Element {
        /**
         * The list of generic type parameters.
         */
        typeParameters: TypedElement[];
    }

    /**
     * Defines the data type for a type.
     */
    export type Type = string;

    /**
     * Defines an element that has an associated type.
     */
    export interface TypedElement extends Element {
        /**
         * The type of the element.
         */
        type?: Type;
    }

    /**
     * Defines a variable declaration.
     */
    export interface VariableDeclaration extends TypedElement {
        /**
         * A value indicating whether or not it is constant.
         */
        isConst?: boolean;
    }

    /**
     * Defines an element that may be optional.
     */
    export interface CanBeOptional {
        /**
         * A value indicating whether or not the element is optional.
         */
        optional?: boolean;
    }

    /**
     * Defines a parameter of a function, method or constructor.
     */
    export interface Parameter extends TypedElement, CanBeOptional {
        /**
         * A value indicating whether or not the parameter is the rest arguments array.
         */
        isDotDotDot?: boolean;
    }

    /**
     * defines a function.
     */
    export interface FunctionDeclaration extends TypedElement, Generic {
        /**
         * The parameters of the function.
         */
        parameters: Parameter[];
    }

    /**
     * Defines an element that can have accessibility modifiers.
     */
    export interface ItemWithAccessibilityModifiers {
        /**
         * A value indicating whether or not the element is protected.
         */
        isProtected?: boolean;

        /**
         * A value indicating whether or not the element is private.
         */
        isPrivate?: boolean;

        /**
         * A value indicating whether or not the element is static.
         */
        isStatic?: boolean;
    }

    /**
     * Defines an element that can be abstract.
     */
    export interface CanBeAbstract {
        /**
         * A value indicating whether or not the element is abstract.
         */
        isAbstract?: boolean;
    }

    /**
     * Defines attributes common to all class and interface members.
     */
    export interface MemberInfo extends TypedElement, CanBeOptional, ItemWithAccessibilityModifiers {
    }

    /**
     * Defines a property on a class or interface.
     */
    export interface PropertyInfo extends MemberInfo, CanBeAbstract {
    }

    /**
     * Defines a method on a class or interface.
     */
    export interface MethodInfo extends MemberInfo, Generic, CanBeAbstract {
        /**
         * The parameters of the function.
         */
        parameters: Parameter[];
    }

    /**
     * Defines an index signature.
     */
    export interface IndexSignature extends TypedElement {
        /**
         * Defines the key for the indexer.
         */
        key: TypedElement;
    }

    /**
     * Defines a type that inherits other types.
     */
    export interface Inheritable extends Element {
        /**
         * Defines the types that this type extends.
         */
        extends?: HeritageClause;

        /**
         * Defines the types that this type implements.
         */
        implements?: HeritageClause;
    }

    /**
     * Defines attributes common to class and interface declarations.
     */
    export interface ClassOrInterfaceLikeDeclaration extends ContainerElement<MemberInfo>, Generic, Inheritable {
    }

    /**
     * Defines a class.
     */
    export interface ClassDeclaration extends ClassOrInterfaceLikeDeclaration, CanBeAbstract {
    }

    /**
     * Defines an interface.
     */
    export interface InterfaceDeclaration extends ClassOrInterfaceLikeDeclaration {
        /**
         * Defines an index signature. 
         */
        indexSignature?: IndexSignature;
    }

    /**
     * Defines a type alias.
     */
    export interface TypeAliasDeclaration extends TypedElement, Generic {
    }

    /**
     * Defines an enum.
     */
    export interface EnumDeclaration extends ContainerElement<EnumMember> {
        /**
         * A value indicating whether or not it is constant.
         */
        isConst?: boolean;
    }

    /**
     * Defines an element which has a value.
     */
    export interface ValueElement extends Element {
        /**
         * The value of the enum member if available.
         */
        value?: string;
    }

    /**
     * Defines an enum member.
     */
    export interface EnumMember extends ValueElement {
    }

    /**
     * Defines a module.
     */
    export interface ModuleDeclaration extends ContainerElement<Element> {
        /**
         * The parent module.
         */
        parent: ModuleDeclaration;

        /**
         * A value indicating whether or not the module is AMD.
         */
        amd?: boolean;

        /**
         * Defines a custom serialization for a module.
         */
        toJSON?(): any;
    }
}
