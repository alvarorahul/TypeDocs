import ko = require("knockout");

import Content = require("ContentWidget");
import EVM = require("EntityViewModels");
import LeftNav = require("LeftNavWidget");

export = Main;

module Main {
    var outerCssClassName = "typedocs-web-outer",
        titleCssClassName = "typedocs-web-title",
        leftNavCssClassName = "typedocs-web-leftNav",
        contentCssClassName = "typedocs-web-content",
        template =
            "<h1 class='" + titleCssClassName + "' data-bind='text: title'></h1>" +
            "<div class='" + leftNavCssClassName + "'></div>" +
            "<div class='" + contentCssClassName + "'></div>";

    export class MainViewModel {
        constructor(filePath: string, tsModules: TypeDocs.Syntax.Module[]) {
            this.title = ko.observable("TypeDocs - " + filePath);
            this.modules = (tsModules || []).map(tsModule => new EVM.ModuleViewModel(tsModule));
        }

        public title: KnockoutObservable<string>;

        public modules: EVM.ModuleViewModel[];
    }

    export class MainWidget {
        private _element: HTMLElement;
        private _viewModel: MainViewModel;

        constructor(element: HTMLElement, viewModel: MainViewModel) {
            this._element = element;
            this._viewModel = viewModel;

            this._element.classList.add(outerCssClassName);
            this._element.innerHTML = template;

            var titleElement = <HTMLElement>this._element.getElementsByClassName(titleCssClassName)[0];
            ko.computed(() => {
                titleElement.innerText = this._viewModel.title();
            });

            this._setupWidgets();
        }

        private _setupWidgets(): void {
            var leftNavElement = <HTMLElement>this._element.getElementsByClassName(leftNavCssClassName)[0],
                leftNavViewModel = new LeftNav.LeftNavViewModel(this._viewModel.modules),
                leftNavWidget = new LeftNav.LeftNavWidget(leftNavElement, leftNavViewModel),
                contentElement = <HTMLElement>this._element.getElementsByClassName(contentCssClassName)[0],
                contentViewModel = new Content.ContentViewModel(leftNavViewModel.selectedElement),
                contentWidget = new Content.ContentWidget(contentElement, contentViewModel);
        }
    }
}
