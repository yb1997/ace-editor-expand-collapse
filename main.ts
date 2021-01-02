import "brace";
import "brace/mode/json";
import "brace/theme/github";
import "brace/theme/tomorrow_night_blue";

declare const ace: any;

type HandlerArgument = {
    editor;
    editorContainer: HTMLElement;
    buttons: { expandBtn: HTMLElement; collapseBtn: HTMLElement };
};
type ResizeButtonClickHandler = (
    event: Event,
    options: HandlerArgument
) => void;

type SetupConfig = {
    editorId: string;
    editorContainer?: HTMLElement;
    theme?: string;
    handlers?: {
        onExpandClick?: ResizeButtonClickHandler;
        onCollapseClick?: ResizeButtonClickHandler;
    };
    text: string;
};

function copyToClipboard(text: string) {
    const textbox = document.createElement("textarea");
    document.body.appendChild(textbox);
    textbox.value = text;
    textbox.select();
    document.execCommand("copy");
    document.body.removeChild(textbox);
}

const hideFullscreen: ResizeButtonClickHandler = _ => {
    document
        .exitFullscreen()
        .then(_ => {})
        .catch(err => {
            console.warn(err);
        });
};

const showFullscreen: ResizeButtonClickHandler = (
    event,
    { editor, editorContainer, buttons: { collapseBtn, expandBtn } }
) => {
    function handleFullscreenChange(e: Event) {
        if (!document.fullscreenElement) {
            collapseBtn.classList.add("d-none");
            expandBtn.classList.remove("d-none");
            editor.container.style.height = "250px";
            editor.resize();
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
        }
    }

    (editorContainer || editor)
        .requestFullscreen()
        .then(_ => {
            editor.container.style.height = "100vh";
            editor.resize();

            if (collapseBtn)
                document.addEventListener(
                    "fullscreenchange",
                    handleFullscreenChange
                );
        })
        .catch(err => {
            console.warn(err);
        });
};

function setup({
    editorId,
    editorContainer,
    theme = "ace/theme/tomorrow_night_blue",
    handlers = {
        onCollapseClick: hideFullscreen,
        onExpandClick: showFullscreen,
    },
    text,
}: SetupConfig) {
    const editor = ace.edit(editorId);
    editor.$blockScrolling = Infinity;
    editor.getSession().setMode("ace/mode/json");
    editor.setTheme(theme);
    editor.setFontSize(16);
    // editor.setReadOnly(true);
    editor.setShowPrintMargin(false);

    if (window["editor"]) {
        window["editor"][editorId] = editor;
    } else {
        window["editor"] = { [editorId]: editor };
    }
    const expandBtn = editorContainer.querySelector(
        ".expand-btn"
    ) as HTMLElement;
    const collapseBtn = editorContainer.querySelector(
        ".collapse-btn"
    ) as HTMLElement;
    const copyBtn = editorContainer.querySelector(".copy-btn") as HTMLElement;
    const { onCollapseClick, onExpandClick } = handlers;

    collapseBtn?.classList?.add("d-none");
    editor.setValue(text);
    editor.clearSelection();

    expandBtn?.addEventListener("click", e => {
        collapseBtn?.classList?.remove("d-none");
        expandBtn?.classList?.add("d-none");
        onExpandClick(e, {
            editor,
            editorContainer,
            buttons: { expandBtn, collapseBtn },
        });
    });

    collapseBtn?.addEventListener("click", e => {
        collapseBtn?.classList?.add("d-none");
        expandBtn?.classList?.remove("d-none");
        onCollapseClick(e, {
            editor,
            editorContainer,
            buttons: { expandBtn, collapseBtn },
        });
    });

    copyBtn?.addEventListener("click", _ => {
        copyToClipboard(editor.getValue());
        alert("copied!");
    });
}

function main() {
    const maxEditorContainer = document.querySelector(
        ".editor-container.fullscreen-example"
    ) as HTMLElement;
    const maxEditor = "max-editor";
    const expandEditor = "expand-editor";
    const expandEditorContainer = document.querySelector(
        ".editor-container.expand-example"
    ) as HTMLElement;

    setup({ 
        editorId: maxEditor, 
        editorContainer: maxEditorContainer, 
        text: JSON.stringify({
            name: "Bruce Wayne",
            height: "6'4",
            age: 44,
            alias: "Batman",
            superpower: "Rich",
            weakness: "Martha"
        }, null, 2)
    });
    setup({
        editorId: expandEditor,
        editorContainer: expandEditorContainer,
        theme: "ace/theme/github",
        handlers: {
            onExpandClick: (e, { editor }) => {
                expandEditorContainer.classList.add("expanded");
                editor.resize();
            },
            onCollapseClick: (e, { editor }) => {
                expandEditorContainer.classList.remove("expanded");
                editor.resize();
            },
        },
        text: JSON.stringify({
            name: "Arthur",
            height: "6'1",
            age: 48,
            alias: "Joker",
            superpower: "Killing Joke",
            weakness: "Fear of being forgotten"
        }, null, 2)
    });
}

main();
