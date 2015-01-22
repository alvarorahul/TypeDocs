import MainWidget = require("MainWidget");

export = Main;

module Main {
    class Program {
        private _element: HTMLElement;

        constructor(element: HTMLElement) {
            this._element = element;
        }

        public run(definitionFilePath: string): void {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    this._process(xhr.responseText, definitionFilePath);
                }
            };
            xhr.open("GET", definitionFilePath, true);
            xhr.send();
        }

        private _process(data: string, definitionFilePath: string): void {
            var options = { underscoreIsPrivate: true },
                inputs = [{
                    sourceText: data,
                    isDeclaration: true,
                    sourceFileName: definitionFilePath
                }],
                generator = new TypeDocs.Generator(inputs, options);

            generator.process();

            this._createView(definitionFilePath, generator.modules);
        }

        private _createView(filePath: string, modules: TypeDocs.Syntax.Module[]): void {
            var mainViewModel = new MainWidget.MainViewModel(filePath, modules);
            var mainWidget = new MainWidget.MainWidget(this._element, mainViewModel);
        }
    }

    var element = <HTMLElement>document.getElementsByClassName("typedocs-web")[0],
        program = new Program(element);

    program.run("/Definitions/typedocs.d.ts");
}
