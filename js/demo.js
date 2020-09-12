"use strict";

/*
 * Author: Alex Vincent
 * Created: 2018-11-22
*/
$(function () {
    "use strict";

    var server_path = "/netdisk",
        base_path = "/netdisk/files";

    var $btns = {
            uploadFile: $(".btn-file-toolbar-primary[name=upload]"),
            addFolder: $(".btn-file-toolbar-secondary[name=add-folder]"),
            deleteFile: $(".btn-file-toolbar-secondary[name=delete]"),
            refresh: $(".btn-file-toolbar-primary[name=refresh]"),
            simulateUpload: $("#simulateUpload")
        },
        $fileTable = $("#fileTable"),
        $modals = {
            upload: {
                el: $("#uploadModal"),
                file: $("#file")
            },
            addFolder: {
                el: $("#addFolderModal"),
                input: $("#new-folder"),
                save: $("#new-folder-save")
            },
            preview: {
                el: $("#previewModal"),
                image: $("#preview-image"),
                audio: $("#preview-audio"),
                video: $("#preview-video"),
                pdf: $("#preview-pdf")
            }
        };

    $('[data-toggle="tooltip"]').tooltip();

    /*** localStorage Migration ***/
    var $stor = {
        get: function get(name) {
            if (typeof Storage !== "undefined") {
                var variable = localStorage.getItem(name);
                if (!isNaN(parseInt(variable))) {
                    variable = parseInt(variable);
                }
                return variable;
            } else {
                window.alert('Please use modern browser !');
            }
        },
        del: function del(name) {
            if (typeof Storage !== "undefined") {
                return localStorage.removeItem(name);
            } else {
                window.alert('Please use modern browser !');
            }
        },
        store: function store(name, value) {
            if (typeof Storage !== "undefined") {
                localStorage.setItem(name, value);
            } else {
                window.alert('Please use modern browser !');
            }
        },
        clean: function clean() {
            if (typeof Storage !== "undefined") {
                var nameReg = /^nd_$/;
                for (var i in window.localStorage) {
                    // for (let i=0, len=window.localStorage.length; i<=len; i++) {
                    var keyName = window.localStorage.key(i);
                    if (nameReg.test(keyName)) window.localStorage.removeItem(keyName);
                }
            } else {
                window.alert('Please use modern browser !');
            }
        }
    };

    /*** APIs ***/
    var $apis = {
        getFileListAjax: function getFileListAjax() {
            return $.getJSON("data/file/file-list");
        },
        getFileList: function getFileList() {
            return JSON.parse($stor.get("nd_file_list"));
        },
        setFileList: function setFileList(list) {
            return $stor.store("nd_file_list", JSON.stringify(list));
        }
    };

    /*** Actions for file ***/
    var $file = {
        currentFolder: 0,
        maxFileId: null,
        loadFileList: function loadFileList(list, parent_id) {
            // $fileTable.find("tbody>tr").off("click mouseover mouseout");
            $fileTable.find("a").off("click");
            $fileTable.bootstrapTable("destroy");
            $fileTable.bootstrapTable({
                data: list,
                columns: [{
                    "checkbox": true
                }, {
                    "class": "text-small",
                    "field": "file_name",
                    "title": "文件名",
                    "formatter": function formatter(value, row) {
                        return "\n                            <a class=\"file-column " + row["file_type"] + "\"\n                                data-file-id=\"" + row["file_id"] + "\"\n                                data-parent-id=\"" + parent_id + "\"\n                            href=\"javascript:;\">\n                                <i class=\"file-type\"></i>" + value + "\n                            </a>\n                            <div class=\"file-action pull-right\">\n                                <!--<a class=\"btn-for-file\"><i class=\"fa fa-share\"></i></a>-->\n                                <a href=\"" + base_path + row["file_path"] + "\" class=\"btn-for-file " + (row["is_folder"] ? "hidden" : "") + "\">\n                                    <i class=\"fa fa-download\"></i>\n                                </a>\n                                <!--<a class=\"btn-for-file\"><i class=\"fa fa-trash\"></i></a>-->\n                            </div>\n                        ";
                    }
                }, {
                    "class": "text-small",
                    "field": "file_size",
                    "title": "大小",
                    "formatter": function formatter(value) {
                        return value !== null ? getFileSize(value) : value;
                    }
                }, {
                    "class": "text-small",
                    "field": "file_last_modified",
                    "title": "修改日期"
                }],
                onCheck: function onCheck() {
                    if ($fileTable.bootstrapTable("getSelections").length) $btns.deleteFile.removeClass("hidden");
                },
                onUncheck: function onUncheck() {
                    if (!$fileTable.bootstrapTable("getSelections").length) $btns.deleteFile.addClass("hidden");
                },
                onCheckAll: function onCheckAll() {
                    if ($fileTable.bootstrapTable("getSelections").length) $btns.deleteFile.removeClass("hidden");
                },
                onUncheckAll: function onUncheckAll() {
                    if (!$fileTable.bootstrapTable("getSelections").length) $btns.deleteFile.addClass("hidden");
                }
            });
            /*** Binding for folder column click. ***/
            $fileTable.find("a.file-column.folder").on("click", function () {
                var file = $file.find($apis.getFileList(), parseInt($(this).attr("data-file-id")));
                var parent_id = $file.currentFolder;
                $file.currentFolder = parseInt($(this).attr("data-file-id"));
                $breadcrumb.add(file["node"]["file_name"], $file.currentFolder, parent_id);
                $file.loadFileList(file["node"]["content_inside"], parent_id);
                $breadcrumb.backToParent.show();
            });
            /*** Binding for image column click. ***/
            $fileTable.find("a.file-column.image").on("click", function () {
                var file = $file.find($apis.getFileList(), parseInt($(this).attr("data-file-id")));
                $modals.preview.image.attr("src", base_path + file["node"]["file_path"]);
                $modals.preview.image.addClass("display");
                $modals.preview.el.modal("show");
            });
            /*** Binding for audio column click. ***/
            $fileTable.find("a.file-column.audio").on("click", function () {
                var file = $file.find($apis.getFileList(), parseInt($(this).attr("data-file-id")));
                $modals.preview.audio.attr("src", base_path + file["node"]["file_path"]);
                $modals.preview.audio.addClass("display");
                $modals.preview.el.modal("show");
            });
            /*** Binding for video column click. ***/
            $fileTable.find("a.file-column.video").on("click", function () {
                var file = $file.find($apis.getFileList(), parseInt($(this).attr("data-file-id")));
                $modals.preview.video.attr("src", base_path + file["node"]["file_path"]);
                $modals.preview.video.addClass("display");
                $modals.preview.el.modal("show");
            });
            /*** Binding for pdf column click. ***/
            $fileTable.find("a.file-column.pdf").on("click", function () {
                var file = $file.find($apis.getFileList(), parseInt($(this).attr("data-file-id")));
                $modals.preview.pdf.attr("src", server_path + "/vendor/pdfjs/web/viewer.html?file=" + base_path + file["node"]["file_path"]);
                $modals.preview.pdf.addClass("display");
                $modals.preview.el.modal("show");
            });
        },
        /*** Using stack to find file in data. ***/
        find: function find(arr, target_id) {
            var stack = []; // Stack for files.
            if (target_id === 0) return $apis.getFileList();
            for (var i in arr) {
                if (!arr.hasOwnProperty(i)) continue;
                stack.push({ parent: -1, index: i, node: arr[i] }); // Push all files in root directory to stack.
            }
            // Keep find when stack is not empty.
            while (stack.length !== 0) {
                // Take out the file in stack's first position.
                var obj = stack.pop();
                var curFile = obj["node"];
                // Is this target file ?
                if (curFile["file_id"] === target_id) {
                    // Found.
                    return obj;
                }
                // Push it's node files to stack if this is a folder and not empty.
                if (curFile["is_folder"]) {
                    for (var _i in curFile["content_inside"]) {
                        if (!curFile["content_inside"].hasOwnProperty(_i)) continue;
                        // Push all files under current path to stack.
                        stack.push({ parent: curFile, index: _i, node: curFile["content_inside"][_i] });
                    }
                }
            }
            // Nothing found.
            return null;
        },
        add: function add(target_id, file) {
            var arr = $apis.getFileList();
            var obj = void 0;
            if (target_id !== 0) {
                // Handle for root directory.
                obj = $file.find(arr, target_id);
                if (obj === null) {
                    // Nothing found.
                    return;
                }
                obj["node"]["content_inside"].push(file);
            } else {
                arr.push(file);
            }
            console.log(arr);
            $apis.setFileList(arr);
        },
        remove: function remove(target_id) {
            var arr = $apis.getFileList();
            var obj = $file.find(arr, target_id);
            if (obj === null) {
                // Nothing found.
                return;
            }
            var obj_parent = obj["parent"];
            if (obj["parent"] === -1) {
                // Handle for root directory.
                arr.splice(obj["index"], 1);
            } else {
                obj_parent["content_inside"].splice(obj["index"], 1);
            }
            $apis.setFileList(arr);
        },
        get: {
            file: function file(name, type, size) {
                var file_type = void 0;
                switch (type) {
                    case 0:
                        file_type = "unknown";
                        break;
                    case 1:
                        file_type = "image";
                        break;
                    case 2:
                        file_type = "audio";
                        break;
                    case 3:
                        file_type = "video";
                        break;
                    case 4:
                        file_type = "pdf";
                        break;
                }
                $file.maxFileId++;
                return {
                    "file_id": $file.maxFileId,
                    "file_name": name,
                    "file_size": size,
                    "file_last_modified": new Date().format("yyyy-MM-dd hh:mm"),
                    "file_type": file_type,
                    "is_folder": false
                };
            },
            folder: function folder(name) {
                $file.maxFileId++;
                return {
                    "file_id": $file.maxFileId,
                    "file_name": name,
                    "file_size": null,
                    "file_last_modified": new Date().format("yyyy-MM-dd hh:mm"),
                    "file_type": "folder",
                    "is_folder": true,
                    "is_empty": true,
                    "content_inside": []
                };
            }
        },
        refresh: function refresh() {
            $breadcrumb.reset();
            $btns.deleteFile.addClass("hidden");
            $file.currentFolder = 0;
            $file.loadFileList($apis.getFileList(), -1);
        }
    };

    /*** An alert at right bottom of view. ***/
    var $alert = {
        el: $(".alert.on-top"),
        dismiss: function dismiss() {
            /*** Hide alert ***/
            $alert.el.removeClass("display");
        },
        display: function display(value) {
            /*** Display alert ***/
            $alert.el.find("p").text(value);
            $alert.el.addClass("display");
        }
    };
    $alert.el.find("close").on("click", function () {
        $alert.dismiss();
    });

    /*** Path breadcrumb ***/
    var $breadcrumb = {
        el: $(".breadcrumb"),
        root: $(".breadcrumb .root"),
        add: function add(name, file_id, parent_id) {
            var $li = $("<li class=\"node inside\" data-file-id=\"" + file_id + "\" data-parent-id=\"" + parent_id + "\"><a>" + name + "</a></li>");
            $li.on("click", function () {
                var file = $file.find($apis.getFileList(), parseInt($(this).attr("data-file-id")));
                $file.loadFileList(file["node"]["content_inside"], parseInt($(this).attr("data-file-id")));
                $file.currentFolder = parseInt($(this).attr("data-file-id"));
                $(this).nextAll().remove();
            });
            $breadcrumb.el.append($li);
        },
        reset: function reset() {
            $breadcrumb.backToParent.hide();
            $breadcrumb.el.find("li.node.inside").remove();
        },
        removeLast: function removeLast() {
            $breadcrumb.el.find("li").last().remove();
        },
        backToParent: {
            el: $(".path-previous"),
            hide: function hide() {
                return $breadcrumb.backToParent.el.removeClass("active");
            },
            show: function show() {
                return $breadcrumb.backToParent.el.addClass("active");
            },
            method: function method(request_id) {
                var file = {},
                    list = void 0;
                if (request_id === 0) {
                    file["parent_id"] = -1;
                    list = $apis.getFileList();
                    $file.currentFolder = 0;
                } else {
                    file = $file.find($apis.getFileList(), request_id);
                    list = file["node"]["content_inside"];
                }
                $file.loadFileList(list, file["parent_id"]);
                if (!$file.currentFolder) $breadcrumb.backToParent.hide();
                $breadcrumb.removeLast();
            }
        }
    };
    $breadcrumb.root.on("click", function () {
        $file.refresh();
    });
    $breadcrumb.backToParent.el.on("click", function () {
        $breadcrumb.backToParent.method(parseInt($breadcrumb.el.find("li.node.inside").last().attr("data-parent-id")));
    });

    $modals.addFolder.el.on("hidden.bs.modal", function () {
        $(this).find("input").val(null);
    });
    $modals.addFolder.input.on("keydown", function (event) {
        // Only works on PC.
        // console.log(event.keyCode, event.key);
        if ( // old migration
            event.keyCode === 56 && // *
            event.keyCode === 186 && // :
            event.keyCode === 188 && // <
            event.keyCode === 190 && // >
            event.keyCode === 191 && // ?/
            event.keyCode === 220 && // \|
            event.keyCode === 222 // "
            && // new migration
            event.key === '*' && event.key === ':' && event.key === '<' && event.key === '>' && event.key === '?' && event.key === '/' && event.key === '\\' && event.key === '|' && event.key === '"') return false;
    }).on("input", function () {
        if (!this.value.length) {
            $modals.addFolder.save.prop("disabled", true);
        } else {
            $modals.addFolder.save.prop("disabled", false);
        }
    });
    $modals.addFolder.save.on("click", function () {
        var filenameReg = /^(?!\.)[^\\\/:*?"<>|]{1,255}$/,
            filename = $modals.addFolder.input.val();
        if (filenameReg.test(filename)) {
            var folder = $file.get.folder(filename);
            $file.add($file.currentFolder, folder);
            $modals.addFolder.el.modal("hide");
            swal("创建成功", "已成功创建文件夹", "success").then(function () {
                if (!$file.currentFolder) {
                    $file.loadFileList($apis.getFileList(), -1);
                } else {
                    var file = $file.find($apis.getFileList(), $file.currentFolder);
                    $file.loadFileList(file["node"]["content_inside"], $file.currentFolder);
                }
            });
        } else {
            swal("创建失败", "请检查名称是否符合规则", "error");
        }
    });
    $modals.preview.el.on("hide.bs.modal", function () {
        $(this).find(".preview-media").each(function () {
            this.pause();
        });
        $modals.preview.pdf.attr("src", null);
    }).on("hidden.bs.modal", function () {
        $(this).find(".preview-el").attr("src", null).removeClass("display");
    });

    /*** Click Delete Button ***/
    $btns.deleteFile.on("click", function () {
        var files = $fileTable.bootstrapTable("getSelections");
        swal({
            title: "删除确认",
            text: "确定删除选中文件吗？",
            icon: "warning",
            buttons: {
                cancel: "取消",
                confirm: "确认"
            },
            dangerMode: true
        }).then(function (confirm) {
            if (confirm) {
                for (let i in files) {
                    if (!files.hasOwnProperty(i)) continue;
                    $file.remove(files[i]["file_id"]);
                }
                swal("删除成功", "已删除指定的文件", "success").then(function () {
                    $btns.deleteFile.addClass("hidden");
                    if ($file.currentFolder === 0) {
                        $file.loadFileList($apis.getFileList(), $file.currentFolder);
                    } else {
                        var file = $file.find($apis.getFileList(), $file.currentFolder);
                        $file.loadFileList(file["node"]["content_inside"], $file.currentFolder);
                    }
                });
            }
        });
    });

    /*** Click Refresh Button ***/
    $btns.refresh.on("click", function () {
        $file.refresh();
    });

    /*** Simulate Upload file ***/
    $btns.simulateUpload.on("click", function () {
        if ($modals.upload.file[0].files.length) {
            var file = $modals.upload.file[0].files[0];
            var file_main_type = file.type.substr(0, 5);
            var type = void 0;
            if (file.type === "") {
                type = 0;
            } else if (file_main_type === "image") {
                type = 1;
            } else if (file_main_type === "audio") {
                type = 2;
            } else if (file_main_type === "video") {
                type = 3;
            } else if (file.type === "application/pdf") {
                type = 4;
            }
            var new_file = $file.get.file(file.name, type, file.size);
            $file.add($file.currentFolder, new_file);
            swal("上传成功", "已成功上传文件", "success").then(function () {
                $modals.upload.el.modal("hide");
                $modals.upload.file.fileinput("reset");
                if (!$file.currentFolder) {
                    $file.loadFileList($apis.getFileList(), -1);
                } else {
                    var _file = $file.find($apis.getFileList(), $file.currentFolder);
                    $file.loadFileList(_file["node"]["content_inside"], $file.currentFolder);
                }
            });
        } else {
            swal("错误", "未选择文件", "error");
        }
    });

    $(document).ready(function () {
        $apis.getFileListAjax().done(function (response) {
            if (responseSuccess(response['status'])) {
                $apis.setFileList(response["data"]["lists"]);
                $file.maxFileId = response["data"]["max_file_id"];
                $stor.store("nd_max_file_id", response["data"]["max_file_id"]);
                $file.loadFileList($apis.getFileList(), -1);
            }
        });
        $modals.upload.file.fileinput({
            language: "zh",
            uploadUrl: "somewhere-to-upload",
            maxFileSize: 102400,
            maxFileCount: 1,
            overwriteInitial: "false"
        });
    });

    function responseSuccess(status) {
        return status === "success";
    }

    function getFileSize(bytes) {
        if (!bytes) return '0 B';
        var k = 1024,
            sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toPrecision(3) + " " + sizes[i];
    }
});

/*** Customized Time Format Getter. ***/
Date.prototype.format = function (format) {
    var date = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S+": this.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, ("" + this.getFullYear()).substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
        }
    }
    return format;
};