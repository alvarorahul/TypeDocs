module TypeDocs.Web {
    export class Program {
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
            var mainViewModel = new MainViewModel(filePath, modules);
            var mainWidget = new MainWidget(this._element, mainViewModel);
        }
    }
}
