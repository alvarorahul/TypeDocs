module TypeDocs.JsDocParser {
    "use strict";

    /**
     * Parses the specified input and creates the JsDoc comment.
     * 
     * @param commentText The input string to be parsed.
     * @return The JsDoc comment.
     */
    export function parse(commentText: string): JsDocComment {
        var description: string,
            parameters: StringMap<string> = {},
            returns: string,
            currentType = "description",
            currentName = "",
            currentText = "",
            updateCommentItem = () => {
                if (currentType === "@param") {
                    parameters[currentName] = currentText;
                } else if (currentType === "@return") {
                    returns = currentText;
                } else {
                    description = currentText;
                }
            },
            trimmedCommentText = commentText.trim(),
            rawLines = trimmedCommentText.substr(2, trimmedCommentText.length - 4).trim(),
            lines = rawLines.split(/\r\n|\r|\n/g).map(c => {
                var line = c.trim();
                if (line.charAt(0) === "*") {
                    line = line.substr(1);
                }

                return line.trim();
            });

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim(),
                newType: string = null,
                newName: string = null,
                newText: string = null;

            if (line.indexOf("@param") === 0) {
                newType = "@param";
                var data = line.substr(6).trim();
                newName = data.substr(0, data.indexOf(" "));
                newText = data.substr(data.indexOf(" ")).trim();
            } else if (line.indexOf("@return") === 0) {
                newType = "@return";
                newText = line.substr(7).trim();
            } else {
                newText = line.trim();
            }

            if (newType) {
                updateCommentItem();

                currentType = newType;
                currentName = newName || "";
                currentText = newText;
            } else {
                currentText = (currentText + (currentText.charAt(currentText.length - 1) === "." ? "\r\n" : " ") + newText).trim();
            }

            if (i === lines.length - 1) {
                updateCommentItem();
            }
        }

        var comment = new JsDocComment();
        comment.description = description;
        comment.parameters = parameters;
        comment.returns = returns;
        return comment;
    }
}
