import YidaSDK from "~/sdk/yida/sdk";
import {
  MomInspectionMeasurement,
  type MomMaterialInventoryBalance,
  MomMaterialWarehouseInventoryBalance,
  MomRouteProcessParameterMeasurement,
  MomTransportOperation,
  MomTransportOperationItem,
  MomWorkFeed,
  MomWorkOrder,
  MomWorkReport,
} from "~/_definitions/meta/entity-types";
import { fmtCharacteristicNorminal } from "~/utils/fmt";
import { isNumeric } from "~/utils/isNumeric";
import dayjs from "dayjs";
import { logAxiosResponse } from "~/utils/axios-utility";
import { Logger } from "@ruiapp/rapid-core";

class YidaApi {
  private logger!: Logger;
  private api!: YidaSDK;

  constructor(logger: Logger, api: YidaSDK) {
    this.logger = logger;
    this.api = api;
  }

  public async getUsers() {
    const fetchUsersFromDept = async (deptId: string) => {
      let users: any[] = [];
      const payload = {
        dept_id: deptId,
        cursor: 0,
        size: 100,
      };

      const resp = await this.api.PostDingtalkResourceRequest("/topapi/v2/user/list", payload);
      if (resp.data && resp.data.result.list) {
        users.push(...resp.data.result.list);
      }

      return users;
    };

    try {
      // 获取顶层部门用户
      const departmentPayload = { language: "zh_CN", dept_id: 1 };
      const departmentResp = await this.api.PostDingtalkResourceRequest("/topapi/v2/department/listsub", departmentPayload);
      const allUsers: any[] = [];

      let users = await fetchUsersFromDept("1");
      allUsers.push(...users);

      if (departmentResp.data && departmentResp.data.result) {
        // 获取每个子部门的用户
        for (const department of departmentResp.data.result) {
          users = await fetchUsersFromDept(department.dept_id);
          allUsers.push(...users);
        }
      }

      return allUsers;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }

  public async uploadTransmitAudit(inputs: MomTransportOperationItem[]) {
    let items = inputs.map((item: MomTransportOperationItem) => {
      let payload: any = {
        textField_m33uqlqd: item.material?.name, // 物料
        textField_m25kjnob: item.lotNum, // 批号
        textField_m25kjnoc: item.sealNum, // 铅封号
        textField_m25kjno9: item.quantity, // 数量
        textField_m2yavq1n: item.manufacturer, // 厂家
        textField_m2yavq1m: item.binNum, // 罐号
        textField_m33uqlqa: item.manufacturerMatch ? "是" : "否", // 厂家/是否一致
        textField_m33uqlqb: item.binNumMatch ? "是" : "否", // 罐号/是否一致
        textField_m33uqlqc: item.sealNumMatch ? "是" : "否", // 铅封号/是否一致
      };
      if (item.sealNumPicture) {
        payload.attachmentField_m25kjnod = [
          // 铅封号照片
          {
            downloadUrl: `http://121.237.179.45:3005/api/download/file?fileKey=${encodeURIComponent(item.sealNumPicture.key)}&fileName=${encodeURIComponent(
              item.sealNumPicture.name,
            )}`,
            name: `${item.sealNumPicture.name}`,
            url: `http://121.237.179.45:3005/api/download/file?fileKey=${encodeURIComponent(item.sealNumPicture.key)}&fileName=${encodeURIComponent(
              item.sealNumPicture.name,
            )}`,
          },
        ];
      }
      payload.attachmentField_m2swtcq5 = [
        // 送货委托单
        {
          downloadUrl: `http://121.237.179.45:3005/api/download/file?fileKey=${encodeURIComponent(item.deliveryOrderFile.key)}&fileName=${encodeURIComponent(
            item.deliveryOrderFile.name,
          )}`,
          name: `${item.deliveryOrderFile.name}`,
          url: `http://121.237.179.45:3005/api/download/file?fileKey=${encodeURIComponent(item.deliveryOrderFile.key)}&fileName=${encodeURIComponent(
            item.deliveryOrderFile.name,
          )}`,
        },
      ];

      payload.attachmentField_m2swtcq6 = [
        // 质检报告
        {
          downloadUrl: `http://121.237.179.45:3005/api/download/file?fileKey=${encodeURIComponent(
            item.qualityInspectionReportFile.key,
          )}&fileName=${encodeURIComponent(item.qualityInspectionReportFile.name)}`,
          name: `${item.qualityInspectionReportFile.name}`,
          url: `http://121.237.179.45:3005/api/download/file?fileKey=${encodeURIComponent(item.qualityInspectionReportFile.key)}&fileName=${encodeURIComponent(
            item.qualityInspectionReportFile.name,
          )}`,
        },
      ];

      return payload;
    });
    const transportOperation = inputs[0].operation;

    let formDataJson = {
      dateField_lmohm4lg: Date.now(), // 申请日期
      textField_m25kjno6: transportOperation?.code, // 运输单号
      textField_m25kjno7: transportOperation?.orderNumb, // 订单号
      textField_m25kjno5: transportOperation?.supplier, // 送货单位
      tableField_m25kjno8: items, // 明细
    };

    let formDataJsonStr = JSON.stringify(formDataJson);

    const dingtalkUserId = transportOperation?.createdBy?.dingtalkUserId || "036025480920111923";

    let payload = {
      noExecuteExpression: true,
      language: "zh_CN",
      formUuid: "FORM-2327400348D843CD817C3AF4164F10A43CNW",
      processCode: "TPROC--4G666BA1ABYO8E7EE4OBVBPMWOH13TG7W812MC",
      searchCondition: "[]",
      appType: "APP_MV044H55941SP5OMR0PI",
      formDataJson: formDataJsonStr,
      systemToken: "9FA66WC107APIRYWEES29D6BYQHM23FRS812MWB",
      userId: dingtalkUserId,
      departmentId: "1",
    };
    const resp = await this.api.PostResourceRequest("/v2.0/yida/processes/instances/start", payload);
    logAxiosResponse(this.logger, "info", resp, "uploadTransmitAudit response");

    return resp.data;
  }

  public async uploadInspectionMeasurements(inputs: MomInspectionMeasurement[]) {
    for (const input of inputs) {
      let upperLimit: any;
      let lowerLimit: any;

      if (input.characteristic?.determineType === "inLimit") {
        if (isNumeric(input.characteristic?.upperLimit)) {
          upperLimit = input.characteristic?.upperLimit;
        }

        if (isNumeric(input.characteristic?.lowerLimit)) {
          lowerLimit = input.characteristic?.lowerLimit;
        }
      }

      if (input.characteristic?.determineType === "inTolerance") {
        if (input.characteristic?.norminal && input.characteristic?.upperTol) {
          if (isNumeric(input.characteristic?.norminal) && isNumeric(input.characteristic?.upperTol)) {
            upperLimit = input.characteristic?.norminal + input.characteristic?.upperTol;
          }
        }

        if (input.characteristic?.norminal && input.characteristic?.lowerTol) {
          if (isNumeric(input.characteristic?.norminal) && isNumeric(input.characteristic?.lowerTol)) {
            lowerLimit = input.characteristic?.norminal + input.characteristic?.lowerTol;
          }
        }
      }

      if (input.characteristic?.determineType === "ge" || input.characteristic?.determineType === "gt") {
        if (isNumeric(input.characteristic?.norminal)) {
          lowerLimit = input.characteristic?.norminal;
        }
      }

      if (input.characteristic?.determineType === "le" || input.characteristic?.determineType === "lt") {
        if (isNumeric(input.characteristic?.norminal)) {
          upperLimit = input.characteristic?.norminal;
        }
      }

      let formDataJson = {
        textField_kocks566: input.sheet?.code, // 检验单号
        textField_kpc0di1h: input.sheet?.rule?.category?.name, // 检验类型
        textField_kocks567: input.sheet?.material?.name, // 物料
        textField_kpc0di1l: input.sheet?.rule?.name, // 检验规则
        textField_kpc0di1i: input.sheet?.lotNum, // 批次
        textField_m245vk9o: input?.isQualified ? "合格" : "不合格", // 结果
        textField_m245vk9m: input.characteristic?.name, // 检验特性
        textField_m245vk9q: fmtCharacteristicNorminal(input.characteristic!), // 标准值
        textField_m245vk9r: input.qualitativeValue || input.quantitativeValue, // 检验值
        textField_m3flq4hm: isNumeric(upperLimit) ? upperLimit.toString() : "",
        textField_m3flq4hn: isNumeric(lowerLimit) ? lowerLimit.toString() : "",
      };

      let formDataJsonStr = JSON.stringify(formDataJson);

      let dingtalkUserId = input.sheet?.createdBy?.dingtalkUserId || "036025480920111923";

      let payload = {
        language: "zh_CN",
        formUuid: "FORM-83F40CCD44614D4788A06E61D9765C1D4SDE",
        appType: "APP_MV044H55941SP5OMR0PI",
        formDataJson: formDataJsonStr,
        systemToken: "9FA66WC107APIRYWEES29D6BYQHM23FRS812MWB",
        userId: dingtalkUserId,
      };

      const resp = await this.api.PostResourceRequest("/v1.0/yida/forms/instances", payload);
      logAxiosResponse(this.logger, "info", resp, "uploadInspectionMeasurements response");
    }

    if (inputs.length > 0) {
      const input = inputs[0];
      if (input?.sheet?.gcmsReportFile) {
        const formDataJson = {
          textField_kocks566: input.sheet?.code, // 检验单号
          textField_kpc0di1h: input.sheet?.rule?.category?.name, // 检验类型
          textField_kocks567: input.sheet?.material?.name, // 物料
          textField_kpc0di1l: input.sheet?.rule?.name, // 检验规则
          textField_kpc0di1i: input.sheet?.lotNum, // 批次
          textField_m245vk9o: input.sheet.gcmsPassed ? "合格" : "不合格", // 结果
          textField_m245vk9m: "GCMS报告", // 检验特性
          textField_m245vk9q: "合格", // 标准值
          textField_m245vk9r: input.sheet.gcmsPassed ? "合格" : "不合格", // 检验值
        };

        let formDataJsonStr = JSON.stringify(formDataJson);

        let dingtalkUserId = input.sheet?.createdBy?.dingtalkUserId || "036025480920111923";

        let payload = {
          language: "zh_CN",
          formUuid: "FORM-83F40CCD44614D4788A06E61D9765C1D4SDE",
          appType: "APP_MV044H55941SP5OMR0PI",
          formDataJson: formDataJsonStr,
          systemToken: "9FA66WC107APIRYWEES29D6BYQHM23FRS812MWB",
          userId: dingtalkUserId,
        };

        const resp = await this.api.PostResourceRequest("/v1.0/yida/forms/instances", payload);
        logAxiosResponse(this.logger, "info", resp, "uploadInspectionSheetAudit response");
      }
    }
  }

  public async uploadInspectionSheetAudit(inputs: MomInspectionMeasurement[]) {
    let measurements = inputs.map((item: MomInspectionMeasurement) => {
      return {
        textField_m24c9bpp: item.characteristic?.name || "",
        textField_m24g6498: item.characteristic?.method?.name || "",
        textField_m24c9bpq: fmtCharacteristicNorminal(item.characteristic!),
        textField_m24c9bpr: item.qualitativeValue || item.quantitativeValue,
        textField_m24g6499: item.isQualified ? "合格" : "不合格",
      };
    });

    if (inputs.length > 0) {
      if (inputs[0]?.sheet?.gcmsReportFile) {
        measurements.push({
          textField_m24c9bpp: "GCMS报告",
          textField_m24g6498: "",
          textField_m24c9bpq: "合格",
          textField_m24c9bpr: inputs[0]?.sheet.gcmsPassed === "qualified" ? "合格" : "不合格",
          textField_m24g6499: inputs[0]?.sheet.gcmsPassed === "qualified" ? "合格" : "不合格",
        });
      }
    }

    const inspectionSheet = inputs[0].sheet;

    let formDataJson: any = {
      dateField_lmoh0yyn: Date.now(), // 检验日期
      textField_m24c9bpt: inspectionSheet?.code, // 检验单号
      textField_m24c9bpu: inspectionSheet?.rule?.category?.name, // 检验类型
      textField_m24c9bps: inspectionSheet?.material?.name, // 物料
      tableField_lmoh0yyo: measurements, // 检验记录
      textField_m24g649a: inspectionSheet?.lotNum, // 批次
    };

    function processAttachmentField(inspectionSheet: any, sourceField: string, targetField: string, formDataJson: any) {
      // 检查源字段是否存在
      if (inspectionSheet?.[sourceField]) {
        // 确保文件数据为数组格式
        const files = Array.isArray(inspectionSheet[sourceField]) ? inspectionSheet[sourceField] : [inspectionSheet[sourceField]];

        // 映射文件数据到表单字段
        formDataJson[targetField] = files.map((file: any) => ({
          downloadUrl: `http://121.237.179.45:3005/api/download/file?fileKey=${encodeURIComponent(file.key)}&fileName=${encodeURIComponent(file.name)}`,
          name: file.name,
          url: `http://121.237.179.45:3005/api/download/file?fileKey=${encodeURIComponent(file.key)}&fileName=${encodeURIComponent(file.name)}`,
        }));
      }
    }

    // Conditionally add each attachment field only if the file exists
    // 报告文件
    processAttachmentField(inspectionSheet, "reportFile", "attachmentField_lmoh0yyt", formDataJson);
    // 月度发票
    processAttachmentField(inspectionSheet, "invoiceReportFile", "attachmentField_md6uim55", formDataJson);
    // 常规检测
    processAttachmentField(inspectionSheet, "normalReportFile", "attachmentField_md6uim54", formDataJson);
    // 质保书
    processAttachmentField(inspectionSheet, "qualityReportFile", "attachmentField_md6uim56", formDataJson);
    // GCMS报告文件
    processAttachmentField(inspectionSheet, "gcmsReportFile", "attachmentField_md6uim57", formDataJson);

    // convert json to string
    let formDataJsonStr = JSON.stringify(formDataJson);

    let dingtalkUserId = inspectionSheet?.createdBy?.dingtalkUserId || "036025480920111923";

    let payload = {
      noExecuteExpression: true,
      language: "zh_CN",
      formUuid: "FORM-857ACE8654FF4F7A942151E1FAA59CDBVYMX",
      processCode: "TPROC--QSC66681WFCP4FR379WET88XRSJT3CAZ8C42M0",
      searchCondition: "[]",
      appType: "APP_MV044H55941SP5OMR0PI",
      formDataJson: formDataJsonStr,
      systemToken: "9FA66WC107APIRYWEES29D6BYQHM23FRS812MWB",
      userId: dingtalkUserId,
      departmentId: "1",
    };
    const resp = await this.api.PostResourceRequest("/v2.0/yida/processes/instances/start", payload);
    logAxiosResponse(this.logger, "info", resp, "uploadInspectionSheetAudit response");

    return resp.data;
  }

  public async uploadProductionMeasurementsAudit(inputs: MomRouteProcessParameterMeasurement[]) {
    let measurements = inputs.map((item: MomRouteProcessParameterMeasurement) => {
      return {
        textField_m24c9bpp: item.dimension?.name || "", // 指标
        textField_m24c9bpq: item.lowerLimit + "~" + item.upperLimit || "",
        textField_m24c9bpr: item.value || "",
        textField_m24g6499: item.isOutSpecification ? "超差" : "正常",
      };
    });

    const workOrder = inputs[0].workOrder;

    let formDataJson = {
      dateField_lmoh0yyn: Date.now(), // 检验日期
      textField_m25kpi4f: workOrder?.factory?.name, // 工厂
      textField_m24c9bps: workOrder?.material?.name, // 检验类型
      textField_m24g649a: workOrder?.lotNum, // 物料
      // textField_m25kpi4d: workOrder?.process?.name, // 检验记录
      // textField_m25kpi4e: workOrder?.equipment?.name, // 批次
      tableField_lmoh0yyo: measurements, // 记录
      // attachmentField_lmoh0yyt: [ // 附件
      //   {
      //     downloadUrl: "https://img.alicdn.com/imgextra/i2/O1CN01wvKGxX1xKF4S3SWrw_!!6000000006424-2-tps-510-93.png",
      //     name: "image.png",
      //     url: "https://img.alicdn.com/imgextra/i2/O1CN01wvKGxX1xKF4S3SWrw_!!6000000006424-2-tps-510-93.png",
      //     ext: "png"
      //   }
      // ]
    };

    // convert json to string
    let formDataJsonStr = JSON.stringify(formDataJson);

    let dingtalkUserId = workOrder?.createdBy?.dingtalkUserId || "036025480920111923";

    let payload = {
      noExecuteExpression: true,
      language: "zh_CN",
      formUuid: "FORM-C615C418035C41E98BB93ED146F0135BLNQG",
      processCode: "TPROC--83766571L7JOTBP29OBTLCQH06J52329FK52MM1",
      searchCondition: "[]",
      appType: "APP_MV044H55941SP5OMR0PI",
      formDataJson: formDataJsonStr,
      systemToken: "9FA66WC107APIRYWEES29D6BYQHM23FRS812MWB",
      userId: dingtalkUserId,
      departmentId: "1",
    };
    const resp = await this.api.PostResourceRequest("/v2.0/yida/processes/instances/start", payload);
    logAxiosResponse(this.logger, "info", resp, "uploadProductionMeasurementsAudit response");

    return resp.data;
  }

  public async uploadProductionMeasurement(input: MomRouteProcessParameterMeasurement) {
    let formDataJson = {
      textField_m25kshxc: input.workOrder?.factory?.code, // 工厂
      textField_kocks567: input.workOrder?.material?.name, // 物料
      textField_m25kshxd: input.process?.name, // 工序
      textField_m25kshxe: input.equipment?.name, // 设备
      textField_kpc0di1i: input.workReport?.lotNum, // 批次
      textField_m25kshxg: input.workOrder?.code, // 工单号
      textField_m245vk9m: input.dimension?.name, // 指标
      textField_m245vk9q: input.nominal, // 标准值
      textField_m2copt7z: input.upperLimit, // 上限
      textField_m2copt80: input.lowerLimit, // 下限
      textField_m245vk9r: input.value, // 检验值
      textField_m2copt81: input.isOutSpecification ? "超差" : "正常",
    };

    let formDataJsonStr = JSON.stringify(formDataJson);

    let dingtalkUserId = input.workOrder?.createdBy?.dingtalkUserId || "036025480920111923";

    let payload = {
      language: "zh_CN",
      formUuid: "FORM-E53DDB7DAD344410AB53826F04074EC1LHIN",
      appType: "APP_MV044H55941SP5OMR0PI",
      formDataJson: formDataJsonStr,
      systemToken: "9FA66WC107APIRYWEES29D6BYQHM23FRS812MWB",
      userId: dingtalkUserId,
    };

    const resp = await this.api.PostResourceRequest("/v1.0/yida/forms/instances", payload);
    logAxiosResponse(this.logger, "info", resp, "uploadProductionMeasurement response");
  }

  public async getAuditDetail(id: string, uid: string, kind: string) {
    let payload = {};
    switch (kind) {
      case "transport":
        payload = {
          language: "zh_CN",
          formUuid: "FORM-2327400348D843CD817C3AF4164F10A43CNW",
          appType: "APP_MV044H55941SP5OMR0PI",
          systemToken: "9FA66WC107APIRYWEES29D6BYQHM23FRS812MWB",
          userId: uid,
        };
        break;
      case "inspect":
        payload = {
          language: "zh_CN",
          formUuid: "FORM-857ACE8654FF4F7A942151E1FAA59CDBVYMX",
          appType: "APP_MV044H55941SP5OMR0PI",
          systemToken: "9FA66WC107APIRYWEES29D6BYQHM23FRS812MWB",
          userId: uid,
        };
    }

    const resp = await this.api.GetResourceRequest(`/v2.0/yida/processes/instancesInfos/${id}`, payload, true);
    logAxiosResponse(this.logger, "info", resp, "getAuditDetail response");

    return resp.data;
  }

  public async uploadTYSProductionRecords(inputs: MomWorkFeed[]) {
    for (const input of inputs) {
      let formDataJson: any = {
        textField_m25kshxc: input?.workOrder?.factory?.name, // 工厂
        textField_kocks567: input?.workOrder?.material?.name, // 物料
        textField_kpc0di1i: input?.workOrder?.lotNum, // 批号
        textField_m25kshxg: input?.workOrder?.code, // 工单号
        textField_m32dy4v0: `150BS:100# {${input?.workOrder?.oilMixtureRatio2}%:{${input?.workOrder?.oilMixtureRatio1}%`, // 混油比例
        textField_m32dy4v5: input?.workOrder?.stirringPressure, // 搅拌压力(MP)
        textField_m32dy4v1: input?.workOrder?.paraffinQuantity, // 石蜡油数量(kg)
        textField_m32dy4v6: input?.workOrder?.tankNumber, // 搅拌罐编号,
        textField_m32dy4v2: input?.workOrder?.stirringTime, // 搅拌时间(分钟)
        textField_m32u20f2: input?.rawMaterial?.name, // 原材料
        textField_m32u20f5: input?.quantity, // 数量
        textField_m32u20f3: input?.lotNum, // 原材料批号
        textField_m32u20f6: input?.equipment?.name, // 设备
        textField_m32u20f4: input?.instoreTankNumber, // 存油罐编号
        textField_m32u20f7: input?.process?.name, // 工序
      };

      if (input?.workOrder?.unloadingVideo) {
        // 卸油视频
        formDataJson.attachmentField_m32dy4va = [
          {
            downloadUrl: `http://121.237.179.45:3005/api/download/file?fileKey=${encodeURIComponent(
              input?.workOrder?.unloadingVideo.key,
            )}&fileName=${encodeURIComponent(input?.workOrder?.unloadingVideo.name)}`,
            name: input?.workOrder?.unloadingVideo.name,
            url: `http://121.237.179.45:3005/api/download/file?fileKey=${encodeURIComponent(
              input?.workOrder?.unloadingVideo.key,
            )}&fileName=${encodeURIComponent(input?.workOrder?.unloadingVideo.name)}`,
          },
        ];
      }

      if (input?.workOrder?.dcsPicture) {
        // DCS液位重量照片
        formDataJson.attachmentField_m32dy4va = [
          {
            downloadUrl: `http://121.237.179.45:3005/api/download/file?fileKey=${encodeURIComponent(
              input?.workOrder?.unloadingVideo.key,
            )}&fileName=${encodeURIComponent(input?.workOrder?.unloadingVideo.name)}`,
            name: input?.workOrder?.unloadingVideo.name,
            url: `http://121.237.179.45:3005/api/download/file?fileKey=${encodeURIComponent(
              input?.workOrder?.unloadingVideo.key,
            )}&fileName=${encodeURIComponent(input?.workOrder?.unloadingVideo.name)}`,
          },
        ];
      }

      let formDataJsonStr = JSON.stringify(formDataJson);

      const dingtalkUserId = input?.workOrder?.createdBy?.dingtalkUserId || "036025480920111923";

      let payload = {
        language: "zh_CN",
        formUuid: "FORM-1F700B466FE248F48DD0A16D3EF884C87V8I",
        appType: "APP_MV044H55941SP5OMR0PI",
        formDataJson: formDataJsonStr,
        systemToken: "9FA66WC107APIRYWEES29D6BYQHM23FRS812MWB",
        userId: dingtalkUserId,
      };

      const resp = await this.api.PostResourceRequest("/v1.0/yida/forms/instances", payload);
      logAxiosResponse(this.logger, "info", resp, "uploadTYSProductionRecords response");
    }
  }

  public async uploadWarehouseInventory(input: MomMaterialWarehouseInventoryBalance) {
    let formDataJson = {
      textField_kocks567: input?.material?.name, // 物料
      textField_m245vk9q: input.material?.safetyStockQuantity, // 安全库存
      textField_m245vk9r: input.onHandQuantity, // 当前库存
    };

    let formDataJsonStr = JSON.stringify(formDataJson);

    let dingtalkUserId = input?.createdBy?.dingtalkUserId || "036025480920111923";

    let payload = {
      language: "zh_CN",
      formUuid: "FORM-75C76D622EE043DCAC65642C72BFE2BBD55S",
      appType: "APP_MV044H55941SP5OMR0PI",
      formDataJson: formDataJsonStr,
      systemToken: "9FA66WC107APIRYWEES29D6BYQHM23FRS812MWB",
      userId: dingtalkUserId,
    };

    const resp = await this.api.PostResourceRequest("/v1.0/yida/forms/instances", payload);
    logAxiosResponse(this.logger, "info", resp, "uploadWarehouseInventory response");
  }

  public async uploadFAWProductionRecord(input: MomWorkReport, feeds: MomWorkFeed[]) {
    for (const feed of feeds) {
      let formDataJson = {
        textField_kocks566: input?.factory?.name, // 工厂
        textField_kpc0di1h: input.workOrder?.code, // 工单
        textField_kocks567: input.workOrder?.material?.name, // 产出物料
        textField_kpc0di1l: input.process?.name, // 工序
        textField_kpc0di1i: input.equipment?.name, // 设备
        textField_kpc0di1m: input.lotNum, // 批号
        textField_m4w0q058: feed.rawMaterial?.name, // 原材料
        textField_m4w0q059: feed.lotNum, // 原材料批号
      };

      let formDataJsonStr = JSON.stringify(formDataJson);

      let dingtalkUserId = input?.createdBy?.dingtalkUserId || "036025480920111923";

      let payload = {
        language: "zh_CN",
        formUuid: "FORM-A0CE81198BD74CFAB5350AA362A3EC2BQDUU",
        appType: "APP_VKCHKCFNQUQZW2R3HFVC",
        formDataJson: formDataJsonStr,
        systemToken: "F2766O91D3BQXRJGCE0387JGX2582G7G15I3M6W3",
        userId: dingtalkUserId,
      };

      const resp = await this.api.PostResourceRequest("/v1.0/yida/forms/instances", payload);
      logAxiosResponse(this.logger, "info", resp, "uploadFAWProductionRecord response");
    }
  }

  public async uploadFAWProcessMeasurement(input: MomRouteProcessParameterMeasurement) {
    if (input?.workReport?.lotNum) {
      let formDataJson = {
        textField_l3plle21: "5RD", // 供应商代码
        textField_l3plle22: "上海华特企业集团股份有限公司", // 供应商名称
        textField_l3plle23: input.process?.carModel, // 车型
        textField_l3plle24: input.process?.partNumber, // 零件号
        textField_l3plle25: input.process?.partName, // 零件名
        textField_l3plle26: input?.fawCode, // 配置
        textField_l3plle27: input.process?.name, // 工位
        textField_l3plle29: input.dimension?.name, // 参数名
        numberField_l3plle2x: input.value, // 参数值
        numberField_l3plle2y: input.lowerLimit, // 下公差
        numberField_l3plle2z: input.upperLimit, // 上公差
        dateField_l3plle30: dayjs(input.createdAt).unix() * 1000,
        textField_l3plle2h: input.isOutSpecification ? "不合格" : "合格",
        textField_l3plle2m: input.process?.partManager, // 零件负责人
        textField_l3plle2o: input.value, // 参数值
        textField_l3plle2q: input.lowerLimit, // 下公差
        textField_l3plle2s: input.upperLimit, // 上公差
        textField_l3plle2u: input.workReport.lotNum, // intime
      };

      let formDataJsonStr = JSON.stringify(formDataJson);

      let dingtalkUserId = input?.createdBy?.dingtalkUserId || "036025480920111923";

      let payload = {
        noExecuteExpression: true,
        language: "zh_CN",
        formUuid: "FORM-E9116BD087B44F1AB0DFC7F86FFB74E2YCGB",
        processCode: "TPROC--9KA66MC17WBQBV2S9T39V5JN6J9Z227G15I3M0",
        searchCondition: "[]",
        appType: "APP_VKCHKCFNQUQZW2R3HFVC",
        formDataJson: formDataJsonStr,
        systemToken: "F2766O91D3BQXRJGCE0387JGX2582G7G15I3M6W3",
        userId: dingtalkUserId,
        departmentId: "1",
      };
      const resp = await this.api.PostResourceRequest("/v2.0/yida/processes/instances/start", payload, true);
      logAxiosResponse(this.logger, "info", resp, "uploadFAWProcessMeasurement response");
      return resp;
    }
  }

  public async uploadFAWInspectionMeasurements(inputs: MomInspectionMeasurement[]) {
    for (const input of inputs) {
      let upperLimit: any;
      let lowerLimit: any;
      let inspectValue: any;

      if (input.characteristic?.determineType === "inLimit") {
        if (isNumeric(input.characteristic?.upperLimit)) {
          upperLimit = input.characteristic?.upperLimit;
        }

        if (isNumeric(input.characteristic?.lowerLimit)) {
          lowerLimit = input.characteristic?.lowerLimit;
        }
      }

      if (input.characteristic?.determineType === "inTolerance") {
        if (input.characteristic?.norminal && input.characteristic?.upperTol) {
          if (isNumeric(input.characteristic?.norminal) && isNumeric(input.characteristic?.upperTol)) {
            upperLimit = input.characteristic?.norminal + input.characteristic?.upperTol;
          }
        }

        if (input.characteristic?.norminal && input.characteristic?.lowerTol) {
          if (isNumeric(input.characteristic?.norminal) && isNumeric(input.characteristic?.lowerTol)) {
            lowerLimit = input.characteristic?.norminal + input.characteristic?.lowerTol;
          }
        }
      }

      if (input.characteristic?.determineType === "ge" || input.characteristic?.determineType === "gt") {
        if (isNumeric(input.characteristic?.norminal)) {
          lowerLimit = input.characteristic?.norminal;
        }
      }

      if (input.characteristic?.determineType === "le" || input.characteristic?.determineType === "lt") {
        if (isNumeric(input.characteristic?.norminal)) {
          upperLimit = input.characteristic?.norminal;
        }
      }

      // TODO: 处理定性情况下的数据上报
      if (input.characteristic?.kind === "qualitative") {
        upperLimit = "0";
        lowerLimit = "0";
        inspectValue = input?.isQualified ? 0 : 1;
      } else {
        inspectValue = input.quantitativeValue;
      }

      let formDataJson = {
        textField_l3plle21: "5RD", // 供应商代码
        textField_l3plle22: "上海华特企业集团股份有限公司", // 供应商名称
        textField_l3plle23: input.sheet?.rule?.carModel, // 车型
        textField_l3plle24: input.sheet?.rule?.partNumber, // 零件号
        textField_l3plle25: input.sheet?.rule?.partName, // 零件名
        textField_l3plle26: input.characteristic?.fawCode, // 配置
        textField_l3plle27: input.sheet?.rule?.category?.name, // 工位
        textField_l3plle29: input.characteristic?.name, // 参数名
        numberField_l3plle2x: inspectValue, // 参数值
        numberField_l3plle2y: lowerLimit, // 下公差
        numberField_l3plle2z: upperLimit, // 上公差
        dateField_l3plle30: dayjs(input.createdAt).unix() * 1000,
        textField_l3plle2h: input?.isQualified ? "合格" : "不合格",
        textField_l3plle2m: input.sheet?.rule?.partManager, // 零件负责人
        textField_l3plle2o: inspectValue, // 参数值
        textField_l3plle2q: lowerLimit, // 下公差
        textField_l3plle2s: upperLimit, // 上公差
        textField_l3plle2u: input.sheet?.lotNum, // intime
      };

      let formDataJsonStr = JSON.stringify(formDataJson);

      let dingtalkUserId = input.sheet?.createdBy?.dingtalkUserId || "036025480920111923";

      let payload = {
        noExecuteExpression: true,
        language: "zh_CN",
        formUuid: "FORM-E9116BD087B44F1AB0DFC7F86FFB74E2YCGB",
        processCode: "TPROC--9KA66MC17WBQBV2S9T39V5JN6J9Z227G15I3M0",
        searchCondition: "[]",
        appType: "APP_VKCHKCFNQUQZW2R3HFVC",
        formDataJson: formDataJsonStr,
        systemToken: "F2766O91D3BQXRJGCE0387JGX2582G7G15I3M6W3",
        userId: dingtalkUserId,
        departmentId: "1",
      };
      const resp = await this.api.PostResourceRequest("/v2.0/yida/processes/instances/start", payload);
      logAxiosResponse(this.logger, "info", resp, "uploadFAWInspectionMeasurements response");
    }

    if (inputs.length > 0) {
      const input = inputs[0];
      if (input?.sheet?.gcmsReportFile) {
        let formDataJson = {
          textField_l3plle21: "5RD", // 供应商代码
          textField_l3plle22: "上海华特企业集团股份有限公司", // 供应商名称
          textField_l3plle23: input.sheet?.rule?.carModel, // 车型
          textField_l3plle24: input.sheet?.rule?.partNumber, // 零件号
          textField_l3plle25: input.sheet?.rule?.partName, // 零件名
          textField_l3plle26: input.sheet?.rule?.conf, // 配置
          textField_l3plle27: input.sheet?.rule?.category?.name, // 工位
          textField_l3plle29: "GCMS报告", // 参数名
          numberField_l3plle2x: input.sheet.gcmsPassed ? 0 : 1, // 参数值
          numberField_l3plle2y: 0, // 下公差
          numberField_l3plle2z: 0, // 上公差
          dateField_l3plle30: dayjs(input.createdAt).unix() * 1000,
          textField_l3plle2h: input.sheet.gcmsPassed ? "合格" : "不合格",
          textField_l3plle2m: input.sheet?.rule?.partManager, // 零件负责人
          textField_l3plle2o: input.sheet.gcmsPassed ? 0 : 1, // 参数值
          textField_l3plle2q: 0, // 下公差
          textField_l3plle2s: 0, // 上公差
          textField_l3plle2u: input.sheet?.lotNum, // intime
        };

        let formDataJsonStr = JSON.stringify(formDataJson);

        let dingtalkUserId = input.sheet?.createdBy?.dingtalkUserId || "036025480920111923";

        let payload = {
          noExecuteExpression: true,
          language: "zh_CN",
          formUuid: "FORM-E9116BD087B44F1AB0DFC7F86FFB74E2YCGB",
          processCode: "TPROC--9KA66MC17WBQBV2S9T39V5JN6J9Z227G15I3M0",
          searchCondition: "[]",
          appType: "APP_VKCHKCFNQUQZW2R3HFVC",
          formDataJson: formDataJsonStr,
          systemToken: "F2766O91D3BQXRJGCE0387JGX2582G7G15I3M6W3",
          userId: dingtalkUserId,
          departmentId: "1",
        };
        const resp = await this.api.PostResourceRequest("/v2.0/yida/processes/instances/start", payload);
        logAxiosResponse(this.logger, "info", resp, "uploadFAWInspectionMeasurements response");
      }
    }
  }

  public async uploadFAWTYSProductionMeasurement(input: MomWorkOrder, feeds: MomWorkFeed[]) {
    // input.oilMixtureRatio

    if (input?.oilMixtureRatio1 && input?.oilMixtureRatio2) {
      const oilMixtureRatio = input.oilMixtureRatio2 / input?.oilMixtureRatio1;
      let formDataJson = {
        textField_l3plle21: "5RD", // 供应商代码
        textField_l3plle22: "上海华特企业集团股份有限公司", // 供应商名称
        textField_l3plle23: "/", // 车型
        textField_l3plle24: "/", // 零件号
        textField_l3plle25: "/", // 零件名
        textField_l3plle26: "/", // 配置
        textField_l3plle27: "泰洋圣生产", // 工位
        textField_l3plle29: "混油比例", // 参数名
        numberField_l3plle2x: oilMixtureRatio, // 参数值
        numberField_l3plle2y: 2.27868852, // 下公差
        numberField_l3plle2z: 2.38983051, // 上公差
        dateField_l3plle30: dayjs(input.createdAt).unix() * 1000,
        textField_l3plle2h: oilMixtureRatio < 2.27868852 || oilMixtureRatio > 2.38983051 ? "不合格" : "合格",
        textField_l3plle2m: "/", // 零件负责人
        textField_l3plle2o: oilMixtureRatio, // 参数值
        textField_l3plle2q: 2.27868852, // 下公差
        textField_l3plle2s: 2.38983051, // 上公差
        textField_l3plle2u: input?.lotNum, // intime
      };

      let formDataJsonStr = JSON.stringify(formDataJson);

      let dingtalkUserId = input?.createdBy?.dingtalkUserId || "036025480920111923";

      let payload = {
        noExecuteExpression: true,
        language: "zh_CN",
        formUuid: "FORM-E9116BD087B44F1AB0DFC7F86FFB74E2YCGB",
        processCode: "TPROC--9KA66MC17WBQBV2S9T39V5JN6J9Z227G15I3M0",
        searchCondition: "[]",
        appType: "APP_VKCHKCFNQUQZW2R3HFVC",
        formDataJson: formDataJsonStr,
        systemToken: "F2766O91D3BQXRJGCE0387JGX2582G7G15I3M6W3",
        userId: dingtalkUserId,
        departmentId: "1",
      };
      const resp = await this.api.PostResourceRequest("/v2.0/yida/processes/instances/start", payload);
      logAxiosResponse(this.logger, "info", resp, "uploadFAWTYSProductionMeasurement response");
    }

    if (input?.tankNumber) {
      let formDataJson = {
        textField_l3plle21: "5RD", // 供应商代码
        textField_l3plle22: "上海华特企业集团股份有限公司", // 供应商名称
        textField_l3plle23: "/", // 车型
        textField_l3plle24: "/", // 零件号
        textField_l3plle25: "/", // 零件名
        textField_l3plle26: "/", // 配置
        textField_l3plle27: "泰洋圣生产", // 工位
        textField_l3plle29: "搅拌罐编号", // 参数名
        numberField_l3plle2x: input.tankNumber === "B01" ? 1 : 0, // 参数值
        numberField_l3plle2y: 1, // 下公差
        numberField_l3plle2z: 1, // 上公差
        dateField_l3plle30: dayjs(input.createdAt).unix() * 1000,
        textField_l3plle2h: input.tankNumber === "B01" ? "合格" : "不合格",
        textField_l3plle2m: "/", // 零件负责人
        textField_l3plle2o: input.tankNumber === "B01", // 参数值
        textField_l3plle2q: 1, // 下公差
        textField_l3plle2s: 1, // 上公差
        textField_l3plle2u: input?.lotNum, // intime
      };

      let formDataJsonStr = JSON.stringify(formDataJson);

      let dingtalkUserId = input?.createdBy?.dingtalkUserId || "036025480920111923";

      let payload = {
        noExecuteExpression: true,
        language: "zh_CN",
        formUuid: "FORM-E9116BD087B44F1AB0DFC7F86FFB74E2YCGB",
        processCode: "TPROC--9KA66MC17WBQBV2S9T39V5JN6J9Z227G15I3M0",
        searchCondition: "[]",
        appType: "APP_VKCHKCFNQUQZW2R3HFVC",
        formDataJson: formDataJsonStr,
        systemToken: "F2766O91D3BQXRJGCE0387JGX2582G7G15I3M6W3",
        userId: dingtalkUserId,
        departmentId: "1",
      };
      const resp = await this.api.PostResourceRequest("/v2.0/yida/processes/instances/start", payload);
      logAxiosResponse(this.logger, "info", resp, "uploadFAWTYSProductionMeasurement response");
    }

    if (input?.stirringTime) {
      let formDataJson = {
        textField_l3plle21: "5RD", // 供应商代码
        textField_l3plle22: "上海华特企业集团股份有限公司", // 供应商名称
        textField_l3plle23: "/", // 车型
        textField_l3plle24: "/", // 零件号
        textField_l3plle25: "/", // 零件名
        textField_l3plle26: "/", // 配置
        textField_l3plle27: "泰洋圣生产", // 工位
        textField_l3plle29: "搅拌时间", // 参数名
        numberField_l3plle2x: input.stirringTime, // 参数值
        numberField_l3plle2y: 55, // 下公差
        numberField_l3plle2z: 65, // 上公差
        dateField_l3plle30: dayjs(input.createdAt).unix() * 1000,
        textField_l3plle2h: input.stirringTime < 55 || input.stirringTime > 65 ? "不合格" : "合格",
        textField_l3plle2m: "/", // 零件负责人
        textField_l3plle2o: input.stirringTime, // 参数值
        textField_l3plle2q: 55, // 下公差
        textField_l3plle2s: 65, // 上公差
        textField_l3plle2u: input?.lotNum, // intime
      };

      let formDataJsonStr = JSON.stringify(formDataJson);

      let dingtalkUserId = input?.createdBy?.dingtalkUserId || "036025480920111923";

      let payload = {
        noExecuteExpression: true,
        language: "zh_CN",
        formUuid: "FORM-E9116BD087B44F1AB0DFC7F86FFB74E2YCGB",
        processCode: "TPROC--9KA66MC17WBQBV2S9T39V5JN6J9Z227G15I3M0",
        searchCondition: "[]",
        appType: "APP_VKCHKCFNQUQZW2R3HFVC",
        formDataJson: formDataJsonStr,
        systemToken: "F2766O91D3BQXRJGCE0387JGX2582G7G15I3M6W3",
        userId: dingtalkUserId,
        departmentId: "1",
      };
      const resp = await this.api.PostResourceRequest("/v2.0/yida/processes/instances/start", payload);
      logAxiosResponse(this.logger, "info", resp, "uploadFAWTYSProductionMeasurement response");
    }

    if (input?.stirringPressure) {
      let formDataJson = {
        textField_l3plle21: "5RD", // 供应商代码
        textField_l3plle22: "上海华特企业集团股份有限公司", // 供应商名称
        textField_l3plle23: "/", // 车型
        textField_l3plle24: "/", // 零件号
        textField_l3plle25: "/", // 零件名
        textField_l3plle26: "/", // 配置
        textField_l3plle27: "泰洋圣生产", // 工位
        textField_l3plle29: "搅拌压力", // 参数名
        numberField_l3plle2x: input.stirringPressure, // 参数值
        numberField_l3plle2y: 0.6, // 下公差
        numberField_l3plle2z: 0.85, // 上公差
        dateField_l3plle30: dayjs(input.createdAt).unix() * 1000,
        textField_l3plle2h: input.stirringPressure < 0.6 || input.stirringPressure > 0.85 ? "不合格" : "合格",
        textField_l3plle2m: "/", // 零件负责人
        textField_l3plle2o: input.stirringTime, // 参数值
        textField_l3plle2q: 0.6, // 下公差
        textField_l3plle2s: 0.85, // 上公差
        textField_l3plle2u: input?.lotNum, // intime
      };

      let formDataJsonStr = JSON.stringify(formDataJson);

      let dingtalkUserId = input?.createdBy?.dingtalkUserId || "036025480920111923";

      let payload = {
        noExecuteExpression: true,
        language: "zh_CN",
        formUuid: "FORM-E9116BD087B44F1AB0DFC7F86FFB74E2YCGB",
        processCode: "TPROC--9KA66MC17WBQBV2S9T39V5JN6J9Z227G15I3M0",
        searchCondition: "[]",
        appType: "APP_VKCHKCFNQUQZW2R3HFVC",
        formDataJson: formDataJsonStr,
        systemToken: "F2766O91D3BQXRJGCE0387JGX2582G7G15I3M6W3",
        userId: dingtalkUserId,
        departmentId: "1",
      };
      const resp = await this.api.PostResourceRequest("/v2.0/yida/processes/instances/start", payload);
      logAxiosResponse(this.logger, "info", resp, "uploadFAWTYSProductionMeasurement response");
    }

    for (const feed of feeds) {
      if (feed?.instoreTankNumber) {
        let formDataJson = {
          textField_l3plle21: "5RD", // 供应商代码
          textField_l3plle22: "上海华特企业集团股份有限公司", // 供应商名称
          textField_l3plle23: "/", // 车型
          textField_l3plle24: "/", // 零件号
          textField_l3plle25: "/", // 零件名
          textField_l3plle26: "/", // 配置
          textField_l3plle27: "泰洋圣生产", // 工位
          textField_l3plle29: "存油罐编号", // 参数名
          numberField_l3plle2x: feed.instoreTankNumber === "A5" || feed.instoreTankNumber === "A6" ? 1 : 0, // 参数值
          numberField_l3plle2y: 1, // 下公差
          numberField_l3plle2z: 1, // 上公差
          dateField_l3plle30: dayjs(input.createdAt).unix() * 1000,
          textField_l3plle2h: feed.instoreTankNumber === "A5" || feed.instoreTankNumber === "A6" ? "合格" : "不合格",
          textField_l3plle2m: "/", // 零件负责人
          textField_l3plle2o: feed.instoreTankNumber === "A5" || feed.instoreTankNumber === "A6" ? 1 : 0, // 参数值
          textField_l3plle2q: 1, // 下公差
          textField_l3plle2s: 1, // 上公差
          textField_l3plle2u: input?.lotNum, // intime
        };

        let formDataJsonStr = JSON.stringify(formDataJson);

        let dingtalkUserId = input?.createdBy?.dingtalkUserId || "036025480920111923";

        let payload = {
          noExecuteExpression: true,
          language: "zh_CN",
          formUuid: "FORM-E9116BD087B44F1AB0DFC7F86FFB74E2YCGB",
          processCode: "TPROC--9KA66MC17WBQBV2S9T39V5JN6J9Z227G15I3M0",
          searchCondition: "[]",
          appType: "APP_VKCHKCFNQUQZW2R3HFVC",
          formDataJson: formDataJsonStr,
          systemToken: "F2766O91D3BQXRJGCE0387JGX2582G7G15I3M6W3",
          userId: dingtalkUserId,
          departmentId: "1",
        };
        const resp = await this.api.PostResourceRequest("/v2.0/yida/processes/instances/start", payload);
        logAxiosResponse(this.logger, "info", resp, "uploadFAWTYSProductionMeasurement response");
      }
    }
  }

  public async uploadFAWTYSTransportMeasurement(inputs: MomTransportOperationItem[]) {
    // input.oilMixtureRatio
    for (const input of inputs) {
      let formDataJson = {
        textField_l3plle21: "5RD", // 供应商代码
        textField_l3plle22: "上海华特企业集团股份有限公司", // 供应商名称
        textField_l3plle23: "/", // 车型
        textField_l3plle24: "/", // 零件号
        textField_l3plle25: "/", // 零件名
        textField_l3plle26: "/", // 配置
        textField_l3plle27: "泰洋圣运输", // 工位
        textField_l3plle29: "铅封号/是否一致", // 参数名
        numberField_l3plle2x: input.sealNumMatch ? 1 : 0, // 参数值
        numberField_l3plle2y: 1, // 下公差
        numberField_l3plle2z: 1, // 上公差
        dateField_l3plle30: dayjs(input.createdAt).unix() * 1000,
        textField_l3plle2h: input.sealNumMatch ? "合格" : "不合格",
        textField_l3plle2m: "/", // 零件负责人
        textField_l3plle2o: input.sealNumMatch ? 1 : 0, // 参数值
        textField_l3plle2q: 1, // 下公差
        textField_l3plle2s: 1, // 上公差
        textField_l3plle2u: input?.lotNum, // intime
      };

      let formDataJsonStr = JSON.stringify(formDataJson);

      let dingtalkUserId = input?.createdBy?.dingtalkUserId || "036025480920111923";

      let payload = {
        noExecuteExpression: true,
        language: "zh_CN",
        formUuid: "FORM-E9116BD087B44F1AB0DFC7F86FFB74E2YCGB",
        processCode: "TPROC--9KA66MC17WBQBV2S9T39V5JN6J9Z227G15I3M0",
        searchCondition: "[]",
        appType: "APP_VKCHKCFNQUQZW2R3HFVC",
        formDataJson: formDataJsonStr,
        systemToken: "F2766O91D3BQXRJGCE0387JGX2582G7G15I3M6W3",
        userId: dingtalkUserId,
        departmentId: "1",
      };
      let resp = await this.api.PostResourceRequest("/v2.0/yida/processes/instances/start", payload);
      logAxiosResponse(this.logger, "info", resp, "uploadFAWTYSTransportMeasurement response");

      formDataJson = {
        textField_l3plle21: "5RD", // 供应商代码
        textField_l3plle22: "上海华特企业集团股份有限公司", // 供应商名称
        textField_l3plle23: "/", // 车型
        textField_l3plle24: "/", // 零件号
        textField_l3plle25: "/", // 零件名
        textField_l3plle26: "/", // 配置
        textField_l3plle27: "泰洋圣运输", // 工位
        textField_l3plle29: "罐号/是否一致", // 参数名
        numberField_l3plle2x: input.binNumMatch ? 1 : 0, // 参数值
        numberField_l3plle2y: 1, // 下公差
        numberField_l3plle2z: 1, // 上公差
        dateField_l3plle30: dayjs(input.createdAt).unix() * 1000,
        textField_l3plle2h: input.binNumMatch ? "合格" : "不合格",
        textField_l3plle2m: "/", // 零件负责人
        textField_l3plle2o: input.binNumMatch ? 1 : 0, // 参数值
        textField_l3plle2q: 1, // 下公差
        textField_l3plle2s: 1, // 上公差
        textField_l3plle2u: input?.lotNum, // intime
      };

      formDataJsonStr = JSON.stringify(formDataJson);

      dingtalkUserId = input?.createdBy?.dingtalkUserId || "036025480920111923";

      payload = {
        noExecuteExpression: true,
        language: "zh_CN",
        formUuid: "FORM-E9116BD087B44F1AB0DFC7F86FFB74E2YCGB",
        processCode: "TPROC--9KA66MC17WBQBV2S9T39V5JN6J9Z227G15I3M0",
        searchCondition: "[]",
        appType: "APP_VKCHKCFNQUQZW2R3HFVC",
        formDataJson: formDataJsonStr,
        systemToken: "F2766O91D3BQXRJGCE0387JGX2582G7G15I3M6W3",
        userId: dingtalkUserId,
        departmentId: "1",
      };
      resp = await this.api.PostResourceRequest("/v2.0/yida/processes/instances/start", payload);
      logAxiosResponse(this.logger, "info", resp, "uploadFAWTYSTransportMeasurement response");

      formDataJson = {
        textField_l3plle21: "5RD", // 供应商代码
        textField_l3plle22: "上海华特企业集团股份有限公司", // 供应商名称
        textField_l3plle23: "/", // 车型
        textField_l3plle24: "/", // 零件号
        textField_l3plle25: "/", // 零件名
        textField_l3plle26: "/", // 配置
        textField_l3plle27: "泰洋圣运输", // 工位
        textField_l3plle29: "厂家/是否一致", // 参数名
        numberField_l3plle2x: input.manufacturerMatch ? 1 : 0, // 参数值
        numberField_l3plle2y: 1, // 下公差
        numberField_l3plle2z: 1, // 上公差
        dateField_l3plle30: dayjs(input.createdAt).unix() * 1000,
        textField_l3plle2h: input.manufacturerMatch ? "合格" : "不合格",
        textField_l3plle2m: "/", // 零件负责人
        textField_l3plle2o: input.manufacturerMatch ? 1 : 0, // 参数值
        textField_l3plle2q: 1, // 下公差
        textField_l3plle2s: 1, // 上公差
        textField_l3plle2u: input?.lotNum, // intime
      };

      formDataJsonStr = JSON.stringify(formDataJson);

      dingtalkUserId = input?.createdBy?.dingtalkUserId || "036025480920111923";

      payload = {
        noExecuteExpression: true,
        language: "zh_CN",
        formUuid: "FORM-E9116BD087B44F1AB0DFC7F86FFB74E2YCGB",
        processCode: "TPROC--9KA66MC17WBQBV2S9T39V5JN6J9Z227G15I3M0",
        searchCondition: "[]",
        appType: "APP_VKCHKCFNQUQZW2R3HFVC",
        formDataJson: formDataJsonStr,
        systemToken: "F2766O91D3BQXRJGCE0387JGX2582G7G15I3M6W3",
        userId: dingtalkUserId,
        departmentId: "1",
      };
      resp = await this.api.PostResourceRequest("/v2.0/yida/processes/instances/start", payload);
      logAxiosResponse(this.logger, "info", resp, "uploadFAWTYSTransportMeasurement response");
    }
  }

  public async uploadFAWStock(input: MomMaterialInventoryBalance) {
    let formDataJson = {
      textField_l3plle21: "5RD", // 供应商代码
      textField_l3plle22: "上海华特企业集团股份有限公司", // 供应商名称
      textField_l3plle23: "AudiA4L", // 车型
      textField_l3plle24: "8WD863947A", // 零件号
      textField_l3plle25: "前围隔音垫", // 零件名
      textField_l3plle26: "/", // 配置
      textField_l3plle27: input.material?.name, // 工位
      textField_l3plle29: "计件库存", // 参数名
      numberField_l3plle2x: input?.onHandQuantity || 0, // 参数值
      numberField_l3plle2y: input.material?.safetyStockQuantity || 0, // 下公差
      // numberField_l3plle2z: input.upperLimit,// 上公差
      dateField_l3plle30: dayjs().unix() * 1000,
      textField_l3plle2h: (input.onHandQuantity || 0) > (input.material?.safetyStockQuantity || 0) ? "合格" : "不合格",
      textField_l3plle2m: "/", // 零件负责人
      textField_l3plle2o: input?.onHandQuantity, // 参数值
      textField_l3plle2q: input.material?.safetyStockQuantity, // 下公差
      // textField_l3plle2s: input.upperLimit,// 上公差
      textField_l3plle2u: "/", // intime
    };

    let formDataJsonStr = JSON.stringify(formDataJson);

    let dingtalkUserId = input?.createdBy?.dingtalkUserId || "036025480920111923";

    let payload = {
      noExecuteExpression: true,
      language: "zh_CN",
      formUuid: "FORM-E9116BD087B44F1AB0DFC7F86FFB74E2YCGB",
      processCode: "TPROC--9KA66MC17WBQBV2S9T39V5JN6J9Z227G15I3M0",
      searchCondition: "[]",
      appType: "APP_VKCHKCFNQUQZW2R3HFVC",
      formDataJson: formDataJsonStr,
      systemToken: "F2766O91D3BQXRJGCE0387JGX2582G7G15I3M6W3",
      userId: dingtalkUserId,
      departmentId: "1",
    };
    const resp = await this.api.PostResourceRequest("/v2.0/yida/processes/instances/start", payload);
    logAxiosResponse(this.logger, "info", resp, "uploadFAWStock response");
  }
}

export default YidaApi;
