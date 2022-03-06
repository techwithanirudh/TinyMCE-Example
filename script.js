var useDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

tinymce.init({
  selector: 'textarea#free',
  plugins: 'tabfocus fullpage print preview paste importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern noneditable help charmap quickbars emoticons',
  imagetools_cors_hosts: ['picsum.photos'],
  menubar: 'file edit view insert format tools table help',
  toolbar: 'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent | numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen preview save print | insertfile image media table badge template link anchor codesample | ltr rtl | fullpage',
  
            // The formats option is where custom formatting options are defined.
            // In this case we define a format for our badge
            // https://www.tiny.cloud/docs/configure/content-formatting/#formats
            formats: {
                badge: {
                    // Declare that a badge should be wrapped in a span
                    inline: 'span',
                    // The span should have these attributes
                    attributes: {
                        class: 'badge',
                        // Replacement variables can also be used
                        style: '%styles'
                    },
                }
            },

            // The inline boundaries option makes our badge respect the end tag and
            // become a "container" of sorts.
            // Compare to bold or italic at the end of a paragraph, there is no way to
            // escape it and type regular text afterwards. It's bold until you turn it off.
            // But with links, inline code – and the badges, we want to be able to type
            // regular text after the element. The `inline_boundaries_selector` allows us
            // to use the arrow keys to escape a badge and continue typing regular text
            // before and afterwards.
            // https://www.tiny.cloud/docs/configure/content-appearance/#inline_boundaries_selector
            inline_boundaries_selector: 'a[href],code,.mce-annotation,span.badge',

            // The following css will be injected into the editor, extending
            // the default styles.
            // In a real world scenario, with much more custom styles for headings
            // links, tables, images etc, it's strongly recommended to use the
            // content_css option to load a separate CSS file. Makes editing easier too.
            // https://www.tiny.cloud/docs/configure/content-appearance/#content_style
            // https://www.tiny.cloud/docs/configure/content-appearance/#content_css
			// It is at the end
            setup: (editor) => {
                // Instead of defining a custom icon pack, we can register individual
                // icons using the API.
                https://www.tiny.cloud/docs/api/tinymce.editor.ui/tinymce.editor.ui.registry/#addicon
                editor.ui.registry.addIcon('badge', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-width="2" transform="rotate(-45 11.894 11.644)"><path d="M5 7h10.343a3 3 0 0 1 2.121.879l3.415 3.414a.997.997 0 0 1 0 1.414l-3.415 3.414a3 3 0 0 1-2.12.879H5a.997.997 0 0 1-1-1V8a.997.997 0 0 1 1-1z"/><path stroke-linecap="round" transform="rotate(-135 15.828 12)" d="M16.414 11.414L15.707 12.121"/></g></svg>');

                // Register a custom toolbar button for opening the badge dialog.
                // https://www.tiny.cloud/docs/ui-components/toolbarbuttons/
                editor.ui.registry.addButton('badge', {
                    icon: 'badge',
                    tooltip: 'Insert/edit badge',
                    onAction: function () {

                        // Get a selected badge's background color or set the
                        // default default color.
                        const backgroundColor = function() {

                            // Fetch the node of the current selection.
                            // https://www.tiny.cloud/docs/api/tinymce.dom/tinymce.dom.selection/
                            node = editor.selection.getNode();

                            // Check if the node has the badge class, if so
                            // it will have a background color style.
                            // https://www.tiny.cloud/docs/api/tinymce.dom/tinymce.dom.domutils/
                            if (editor.dom.hasClass(node, 'badge')) {
                                return node.style.backgroundColor;
                            }

                            // If the selection contains no badge, then set the default color.
                            return 'rgb(0, 123, 255)';
                        }

                        // Get a selected badge's text color or set the
                        // default default color. This is the same as
                        // background color above but for text color.
                        const textColor = function() {
                            node = editor.selection.getNode();

                            if (editor.dom.hasClass(node, 'badge')) {
                                return node.style.color;
                            }

                            return 'rgb(255, 255, 255)';
                        }

                        // Open a TinyMCE modal where the user can set the badge's
                        // background and text color.
                        // https://www.tiny.cloud/docs/ui-components/dialog/
                        // https://www.tiny.cloud/docs/ui-components/dialogcomponents/
                        editor.windowManager.open({
                            title: 'Insert/edit Badge',
                            body: {
                                type: 'panel',
                                items: [
                                    {
                                        type: 'colorinput', // component type
                                        name: 'backgroundcolor', // identifier
                                        label: 'Background color' // text for the label
                                    },
                                    {
                                        type: 'colorinput', // component type
                                        name: 'textcolor', // identifier
                                        label: 'Text color' // text for the label
                                    }
                                ]
                            },
                            buttons: [
                            {
                                type: 'cancel',
                                name: 'closeButton',
                                text: 'Cancel'
                            },
                            {
                                type: 'submit',
                                name: 'submitButton',
                                text: 'Save',
                                primary: true
                            }
                            ],
                            initialData: {
                                backgroundcolor: backgroundColor(),
                                textcolor: textColor()
                            },
                            onSubmit: function (dialog) {
                                // Get the form data.
                                var data = dialog.getData();

                                // Get the currently selected node.
                                // https://www.tiny.cloud/docs/api/tinymce.dom/tinymce.dom.selection/
                                const node = editor.selection.getNode();

                                // Working directly with the DOM often requires manually adding
                                // the actions to the undo stack.
                                // https://www.tiny.cloud/docs/api/tinymce/tinymce.undomanager/
                                editor.undoManager.transact(() => {
                                    // Check if the selected node is a badge.
                                    // https://www.tiny.cloud/docs/api/tinymce.dom/tinymce.dom.domutils/
                                    if (editor.dom.hasClass(node, 'badge')) {
                                        // If the selection is a badge, we manipulate the styles directly
                                        // instead of using the formatter to set a new format which caused
                                        // nested spans (it creates a badge inside the badge).
                                        // https://www.tiny.cloud/docs/api/tinymce.dom/tinymce.dom.domutils/#setstyles
                                        editor.dom.setStyles(node, {'background-color': data.backgroundcolor, 'color': data.textcolor});
                                    }
                                    else {
                                        // If not a badge, then apply the badge format to the current selection
                                        // or the word the text caret is currently placed in.
                                        // https://www.tiny.cloud/docs/api/tinymce/tinymce.formatter/#apply
                                        editor.formatter.apply('badge', {styles: `background-color: ${data.backgroundcolor}; color: ${data.textcolor};`});
                                    }
                                });

                                // Tell TinyMCE that the ui has been updated.
                                // https://www.tiny.cloud/docs/api/tinymce/tinymce.editor/#nodechanged
                                editor.nodeChanged();

                                // Close the dialog.
                                dialog.close();
                            }
                        });
                    }
                });
            },
  toolbar_sticky: true,
  browser_spellcheck: true,
  autosave_ask_before_unload: true,
  autosave_interval: '30s',
  autosave_prefix: '{path}{query}-{id}-',
  autosave_restore_when_empty: false,
  autosave_retention: '2m',
  image_advtab: true,
  link_list: [
    { title: 'My page 1', value: 'https://www.tiny.cloud' },
    { title: 'My page 2', value: 'http://www.moxiecode.com' }
  ],
  image_list: [
    { title: 'My page 1', value: 'https://www.tiny.cloud' },
    { title: 'My page 2', value: 'http://www.moxiecode.com' }
  ],
  image_class_list: [
    { title: 'None', value: '' },
    { title: 'Some class', value: 'class-name' }
  ],
  importcss_append: true,
  file_picker_callback: function (callback, value, meta) {
    /* Provide file and text for the link dialog */
    if (meta.filetype === 'file') {
      callback('https://www.google.com/logos/google.jpg', { text: 'My text' });
    }

    /* Provide image and alt text for the image dialog */
    if (meta.filetype === 'image') {
      callback('https://www.google.com/logos/google.jpg', { alt: 'My alt text' });
    }

    /* Provide alternative source and posted for the media dialog */
    if (meta.filetype === 'media') {
      callback('movie.mp4', { source2: 'alt.ogg', poster: 'https://www.google.com/logos/google.jpg' });
    }
  },
  templates: [
        { title: 'New Table', description: 'creates a new table', content: '<div class="mceTmpl"><table width="98%%"  border="0" cellspacing="0" cellpadding="0"><tr><th scope="col"> </th><th scope="col"> </th></tr><tr><td> </td><td> </td></tr></table></div>' },
    { title: 'Starting my story', description: 'A cure for writers block', content: 'Once upon a time...' },
    { title: 'New list with dates', description: 'New List with dates', content: '<div class="mceTmpl"><span class="cdate">cdate</span><br /><span class="mdate">mdate</span><h2>My List</h2><ul><li></li><li></li></ul></div>' }
  ],
  template_cdate_format: '[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]',
  template_mdate_format: '[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]',
  height: 600,
  image_caption: true,
  quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
  noneditable_noneditable_class: 'mceNonEditable',
  toolbar_mode: 'sliding',
  contextmenu: 'link image imagetools table',
  skin: useDarkMode ? 'oxide-dark' : 'oxide',
  // content_css: useDarkMode ? 'dark' : 'default',
  content_css: useDarkMode ? 'dark' : 'document',
  content_style: `
    body { 
		font-family: Helvetica, Arial, sans-serif; 
		font-size:14px 
	}
	
    span.badge {
    	background-color: gray;
        display: inline-block;
        background-color: #007bff;
        color: #fff;
        padding: 0px 4px;
        border-radius: 4px;
        font-weight: 600;
    }
  `,
  fullscreen_native: true
 });

setTimeout(() => {
	tinymce.activeEditor.execCommand('mceFullScreen');
}, 1500)