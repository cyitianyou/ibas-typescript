/**
 * @license
 * Copyright color-coding studio. All Rights Reserved.
 *
 * Use of this source code is governed by an Apache License, Version 2.0
 * that can be found in the LICENSE file at http://www.apache.org/licenses/LICENSE-2.0
 */

/// <reference path="../../../../../../openui5/typings/index.d.ts" />
import * as ibas from "../../../../../../ibas/index";
import * as bo from "../../../borep/bo/index";
import { IDemoListView } from "../../../bsapp/demo/index";

/**
 * 视图-demo
 */
export class DemoListView extends ibas.BOListView implements IDemoListView {

    /** 编辑数据，参数：目标数据 */
    editDataEvent: Function;
    /** 绘制视图 */
    darw(): any {
        let that = this;
        let form = new sap.uxap.ObjectPageLayout("");
        let headerTitle = new sap.uxap.ObjectPageHeader("", {
            headerDesign: sap.uxap.ObjectPageHeaderDesign.Dark,
            isObjectSubtitleAlwaysVisible: false,
            isActionAreaAlwaysVisible: false,
            isObjectTitleAlwaysVisible: false,
            navigationBar: new sap.m.Bar("", {
                contentLeft: [

                ],
                contentMiddle: [
                    new sap.m.Button("", {
                        text: ibas.i18n.prop("sys_shell_ui_data_new"),
                        type: sap.m.ButtonType.Transparent,
                        icon: "sap-icon://create",
                        press: function (): void {
                            that.fireViewEvents(that.newDataEvent);
                        }
                    }),
                    new sap.m.Button("", {
                        text: ibas.i18n.prop("sys_shell_ui_data_view"),
                        type: sap.m.ButtonType.Transparent,
                        icon: "sap-icon://display",
                        press: function (): void {
                            that.fireViewEvents(that.viewDataEvent);
                        }
                    }),
                    new sap.m.Button("", {
                        text: ibas.i18n.prop("sys_shell_ui_data_edit"),
                        type: sap.m.ButtonType.Transparent,
                        icon: "sap-icon://edit",
                        press: function (): void {
                            that.fireViewEvents(that.editDataEvent);
                        }
                    })
                ],
                contentRight: [
                ]
            })
        });
        form.addHeaderContent(headerTitle);
        this.table = new sap.m.Table("", {
            columns: [
                new sap.m.Column({
                    header: new sap.m.Label("", {
                        text: ibas.i18n.prop("bo_salesorder_docentry")
                    }),
                    template: new sap.m.Text("", {
                        text: "{docEntry}"
                    })
                }),
                new sap.m.Column({
                    header: new sap.m.Label("", {
                        text: ibas.i18n.prop("bo_salesorder_customer")
                    }),
                    template: new sap.m.Text("", {
                        text: "{customer}"
                    })
                }),
                new sap.m.Column({
                    header: new sap.m.Label("", {
                        text: ibas.i18n.prop("bo_salesorder_documentstatus")
                    }),
                    template: new sap.m.Text("", {
                        text: "{documentStatus}"
                    })
                }),
                new sap.m.Column({
                    header: new sap.m.Label("", {
                        text: ibas.i18n.prop("bo_salesorder_canceled")
                    }),
                    template: new sap.m.Text("", {
                        text: "{canceled}"
                    })
                })
            ]
        });
        form.addSection(new sap.uxap.ObjectPageSection("", {
            subSections: [new sap.uxap.ObjectPageSubSection("", {
                blocks: [this.table]
            })]
        }));
        this.id = form.getId();
        return form;
    }
    private table: sap.m.Table;
    /** 显示数据 */
    showData(datas: any): void {
        let uiDatas = new sap.ui.model.json.JSONModel(datas);
        this.table.setModel(uiDatas);
        this.table.bindItems("/");
    }
    /** 嵌入查询面板 */
    embedded(view: any): void {

    }
}