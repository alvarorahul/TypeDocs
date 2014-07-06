/// <reference path="TypeScript/Program.ts" />
module TypeDocs.Web {
    window.onload = () => {
        var element = <HTMLElement>document.getElementsByClassName("typedocs-web")[0],
            program = new Program(element);

        program.run("/Definitions/typedocs.d.ts");
    };
}
