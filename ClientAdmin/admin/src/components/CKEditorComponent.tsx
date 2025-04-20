import { useState, useEffect, useRef, useMemo } from "react";
import { CKEditor, useCKEditorCloud } from "@ckeditor/ckeditor5-react";
import "../App.css";

const LICENSE_KEY =
	'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NDYwNTc1OTksImp0aSI6IjBlZTBkYzk5LTkxNjQtNDBiYy1hOTFiLTg0OThkNDU0MzNhYyIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjgzNTQwOTBmIn0.j68UPVbcn6GS8QTeFm_1fqB2rx_EBs7rCs77nw5WK00Om9TErZq9hztuUFT0i3qvdDGoFF7V2Kev2PzJa4f-OQ';
const CLOUD_SERVICES_TOKEN_URL =
"https://iodgz4jqkp87.cke-cs.com/token/dev/622ecabbc73c9de15847e9bd016f61f47fd6c5cf3e4b1dad816a089c58ad?limit=10"
export const CKEditorComponent = ({ value, onChange }: any) => {
    const editorContainerRef = useRef(null);
    const editorRef = useRef(null);
    const [isLayoutReady, setIsLayoutReady] = useState(false);
    const cloud = useCKEditorCloud({
        version: "44.1.0",
        translations: ["vi"],
        ckbox: { version: "2.6.1" },
    });

    useEffect(() => {
        setIsLayoutReady(true);
        return () => setIsLayoutReady(false);
    }, []);

    const { ClassicEditor, editorConfig } = useMemo(() => {
        if (cloud.status !== "success" || !isLayoutReady) {
            return {};
        }

        const {
            ClassicEditor,
            Autoformat,
            AutoImage,
            Autosave,
            BlockQuote,
            Bold,
            CKBox,
            CKBoxImageEdit,
            CloudServices,
            Essentials,
            Heading,
            ImageBlock,
            ImageCaption,
            ImageInline,
            ImageInsert,
            ImageInsertViaUrl,
            ImageResize,
            ImageStyle,
            ImageTextAlternative,
            ImageToolbar,
            ImageUpload,
            Indent,
            IndentBlock,
            Italic,
            Link,
            LinkImage,
            List,
            ListProperties,
            MediaEmbed,
            Paragraph,
            PasteFromOffice,
            PictureEditing,
            Table,
            TableCaption,
            TableCellProperties,
            TableColumnResize,
            TableProperties,
            TableToolbar,
            TextTransformation,
            TodoList,
            Underline,
        } = cloud.CKEditor;

        return {
            ClassicEditor,
            editorConfig: {
                // Các công cụ hiển thị trên thanh công cụ
                toolbar: {
                    items: [
                        "heading",
                        "|",
                        "bold",
                        "italic",
                        "underline",
                        "|",
                        "link",
                        "insertImage",
                        "ckbox",
                        "mediaEmbed",
                        "insertTable",
                        "blockQuote",
                        "|",
                        "bulletedList",
                        "numberedList",
                        "todoList",
                        "outdent",
                        "indent",
                    ],
                    shouldNotGroupWhenFull: false,
                },
                // Danh sách các plugin được sử dụng
                plugins: [
                    Autoformat,
                    AutoImage,
                    Autosave,
                    BlockQuote,
                    Bold,
                    CKBox,
                    CKBoxImageEdit,
                    CloudServices,
                    Essentials,
                    Heading,
                    ImageBlock,
                    ImageCaption,
                    ImageInline,
                    ImageInsert,
                    ImageInsertViaUrl,
                    ImageResize,
                    ImageStyle,
                    ImageTextAlternative,
                    ImageToolbar,
                    ImageUpload,
                    Indent,
                    IndentBlock,
                    Italic,
                    Link,
                    LinkImage,
                    List,
                    ListProperties,
                    MediaEmbed,
                    Paragraph,
                    PasteFromOffice,
                    PictureEditing,
                    Table,
                    TableCaption,
                    TableCellProperties,
                    TableColumnResize,
                    TableProperties,
                    TableToolbar,
                    TextTransformation,
                    TodoList,
                    Underline,
                ],
                // Cấu hình URL kết nối cloud.
                cloudServices: {
                    tokenUrl: CLOUD_SERVICES_TOKEN_URL,
                },
                // heading: Định dạng các tiêu đề (h1, h2, h3...).
                heading: {
                    options: [
                        {
                            model: "paragraph",
                            title: "Paragraph",
                            class: "ck-heading_paragraph",
                        },
                        {
                            model: "heading1",
                            view: "h1",
                            title: "Heading 1",
                            class: "ck-heading_heading1",
                        },
                        {
                            model: "heading2",
                            view: "h2",
                            title: "Heading 2",
                            class: "ck-heading_heading2",
                        },
                        {
                            model: "heading3",
                            view: "h3",
                            title: "Heading 3",
                            class: "ck-heading_heading3",
                        },
                        {
                            model: "heading4",
                            view: "h4",
                            title: "Heading 4",
                            class: "ck-heading_heading4",
                        },
                        {
                            model: "heading5",
                            view: "h5",
                            title: "Heading 5",
                            class: "ck-heading_heading5",
                        },
                        {
                            model: "heading6",
                            view: "h6",
                            title: "Heading 6",
                            class: "ck-heading_heading6",
                        },
                    ],
                },
                // image: Công cụ chỉnh sửa ảnh,
                image: {
                    toolbar: [
                        "toggleImageCaption",
                        "imageTextAlternative",
                        "|",
                        "imageStyle:inline",
                        "imageStyle:wrapText",
                        "imageStyle:breakText",
                        "|",
                        "resizeImage",
                        "|",
                        "ckboxImageEdit",
                    ],
                },
                initialData: value,
                language: "vi",
                licenseKey: LICENSE_KEY,
                link: {
                    addTargetToExternalLinks: true,
                    defaultProtocol: "https://",
                    decorators: {
                        toggleDownloadable: {
                            mode: "manual",
                            label: "Downloadable",
                            attributes: {
                                download: "file",
                            },
                        },
                    },
                },
                list: {
                    properties: {
                        styles: true,
                        startIndex: true,
                        reversed: true,
                    },
                },
                placeholder: "Type or paste your content here!",
                table: {
                    contentToolbar: [
                        "tableColumn",
                        "tableRow",
                        "mergeTableCells",
                        "tableProperties",
                        "tableCellProperties",
                    ],
                },
            },
        };
    }, [cloud, isLayoutReady]);

    useEffect(() => {
        if (editorConfig) {
            configUpdateAlert(editorConfig);
        }
    }, [editorConfig]);

    return (
        <div className="main-container">
            <div
                className="editor-container editor-container_classic-editor"
                ref={editorContainerRef}
            >
                <div className="editor-container__editor">
                    <div ref={editorRef}>
                        {ClassicEditor && editorConfig && (
                            <CKEditor
                                editor={ClassicEditor}
                                config={editorConfig}
                                data={value}
                                onChange={(event, editor) =>
                                    onChange(editor.getData())
                                }
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

function configUpdateAlert(config) {
    if (configUpdateAlert.configUpdateAlertShown) {
        return;
    }

    const isModifiedByUser = (currentValue, forbiddenValue) => {
        if (currentValue === forbiddenValue) {
            return false;
        }

        if (currentValue === undefined) {
            return false;
        }

        return true;
    };

    const valuesToUpdate = [];

    configUpdateAlert.configUpdateAlertShown = true;

    if (
        !isModifiedByUser(
            config.cloudServices?.tokenUrl,
            "<YOUR_CLOUD_SERVICES_TOKEN_URL>"
        )
    ) {
        valuesToUpdate.push("CLOUD_SERVICES_TOKEN_URL");
    }

    if (valuesToUpdate.length) {
        window.alert(
            [
                "Please update the following values in your editor config",
                "to receive full access to Premium Features:",
                "",
                ...valuesToUpdate.map((value) => ` - ${value}`),
            ].join("\n")
        );
    }
}
