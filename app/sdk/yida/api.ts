import YidaSDK from "~/sdk/yida/sdk";
import {
  MomInspectionMeasurement,
  MomRouteProcessParameterMeasurement,
  MomTransportOperationItem,
  MomWorkOrder
} from "~/_definitions/meta/entity-types";
import {fmtCharacteristicNorminal} from "~/utils/fmt";

class YidaApi {
  private api!: YidaSDK;

  constructor(api: YidaSDK) {
    this.api = api;
  }

  public async uploadTransmitAudit(inputs: MomTransportOperationItem[]) {
    let items = inputs.map((item: MomTransportOperationItem) => {
      let payload: any = {
        textField_m25kjnoa: item.material?.name, // 物料
        textField_m25kjnob: item.lotNum, // 批号
        textField_m25kjnoc: item.sealNum, // 铅封号
        textField_m25kjno9: item.quantity, // 数量
        textField_m2yavq1n: item.manufacturer, // 厂家
        textField_m2yavq1m: item.binNum, // 罐号
      }
      if (item.sealNumPicture) {
        payload.attachmentField_m25kjnod = [ // 铅封号照片
          {
            downloadUrl: `http://121.237.179.45:3005/api/download/file?fileKey=${ encodeURIComponent(item.sealNumPicture.key) }&fileName=${ encodeURIComponent(item.sealNumPicture.name) }`,
            name: `${ item.sealNumPicture.name }`,
            url: `http://121.237.179.45:3005/api/download/file?fileKey=${ encodeURIComponent(item.sealNumPicture.key) }&fileName=${ encodeURIComponent(item.sealNumPicture.name) }`
          }
        ];
      }
      payload.attachmentField_m2swtcq5 = [ // 送货委托单
        {
          downloadUrl: `http://121.237.179.45:3005/api/download/file?fileKey=${ encodeURIComponent(item.deliveryOrderFile.key) }&fileName=${ encodeURIComponent(item.deliveryOrderFile.name) }`,
          name: `${ item.deliveryOrderFile.name }`,
          url: `http://121.237.179.45:3005/api/download/file?fileKey=${ encodeURIComponent(item.deliveryOrderFile.key) }&fileName=${ encodeURIComponent(item.deliveryOrderFile.name) }`
        }
      ];

      payload.attachmentField_m2swtcq6 = [ // 质检报告
        {
          downloadUrl: `http://121.237.179.45:3005/api/download/file?fileKey=${ encodeURIComponent(item.qualityInspectionReportFile.key) }&fileName=${ encodeURIComponent(item.qualityInspectionReportFile.name) }`,
          name: `${ item.qualityInspectionReportFile.name }`,
          url: `http://121.237.179.45:3005/api/download/file?fileKey=${ encodeURIComponent(item.qualityInspectionReportFile.key) }&fileName=${ encodeURIComponent(item.qualityInspectionReportFile.name) }`
        }
      ];

      return payload;
    })
    const transportOperation = inputs[0].operation

    let formDataJson = {
      dateField_lmohm4lg: Date.now(), // 申请日期
      textField_m25kjno6: transportOperation?.code, // 运输单号
      textField_m25kjno7: transportOperation?.orderNumb, // 订单号
      textField_m25kjno5: transportOperation?.supplier, // 送货单位
      tableField_m25kjno8: items, // 明细
    }

    let formDataJsonStr = JSON.stringify(formDataJson);

    let payload =
      {
        noExecuteExpression: true,
        language: "zh_CN",
        formUuid: "FORM-2327400348D843CD817C3AF4164F10A43CNW",
        processCode: "TPROC--4G666BA1ABYO8E7EE4OBVBPMWOH13TG7W812MC",
        searchCondition: "[]",
        appType: "APP_MV044H55941SP5OMR0PI",
        formDataJson: formDataJsonStr,
        systemToken: "9FA66WC107APIRYWEES29D6BYQHM23FRS812MWB",
        userId: "68282452959857472",
        departmentId: "1"
      }
    const resp = await this.api.PostResourceRequest("/v2.0/yida/processes/instances/start", payload)
    console.log(resp.data)

    return resp.data;
  }

  public async uploadInspectionMeasurements(inputs: MomInspectionMeasurement[]) {
    for (const input of inputs) {
      let formDataJson = {
        textField_kocks566: input.sheet?.code, // 检验单号
        textField_kpc0di1h: input.sheet?.rule?.category?.name,// 检验类型
        textField_kocks567: input.sheet?.material?.name,// 物料
        textField_kpc0di1l: input.sheet?.rule?.name,// 检验规则
        textField_kpc0di1i: input.sheet?.lotNum,// 批次
        textField_m245vk9o: input.sheet?.result === 'qualified' ? '合格' : '不合格',// 结果
        textField_m245vk9m: input.characteristic?.name,// 检验特性
        textField_m245vk9q: fmtCharacteristicNorminal(input.characteristic!), // 标准值
        textField_m245vk9r: input.qualitativeValue || input.quantitativeValue,// 检验值
      }

      let formDataJsonStr = JSON.stringify(formDataJson);

      let payload = {
        language: "zh_CN",
        formUuid: "FORM-83F40CCD44614D4788A06E61D9765C1D4SDE",
        appType: "APP_MV044H55941SP5OMR0PI",
        formDataJson: formDataJsonStr,
        systemToken: "9FA66WC107APIRYWEES29D6BYQHM23FRS812MWB",
        userId: "68282452959857472"
      }

      const resp = await this.api.PostResourceRequest("/v1.0/yida/forms/instances", payload, true)
      console.log(resp.data)
    }

    if (inputs.length > 0) {
      const input = inputs[0];
      if (input?.sheet?.gcmsReportFile) {
        const formDataJson = {
          textField_kocks566: input.sheet?.code, // 检验单号
          textField_kpc0di1h: "",// 检验类型
          textField_kocks567: input.sheet?.material?.name,// 物料
          textField_kpc0di1l: "GCMS报告",// 检验规则
          textField_kpc0di1i: input.sheet?.lotNum,// 批次
          textField_m245vk9o: input.sheet.gcmsPassed  ? '合格' : '不合格',// 结果
          textField_m245vk9m: input.characteristic?.name,// 检验特性
          textField_m245vk9q: "合格", // 标准值
          textField_m245vk9r: input.sheet.gcmsPassed  ? '合格' : '不合格',// 检验值
        }

        let formDataJsonStr = JSON.stringify(formDataJson);

        let payload = {
          language: "zh_CN",
          formUuid: "FORM-83F40CCD44614D4788A06E61D9765C1D4SDE",
          appType: "APP_MV044H55941SP5OMR0PI",
          formDataJson: formDataJsonStr,
          systemToken: "9FA66WC107APIRYWEES29D6BYQHM23FRS812MWB",
          userId: "68282452959857472"
        }

        const resp = await this.api.PostResourceRequest("/v1.0/yida/forms/instances", payload, true)
        console.log(resp.data)
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
        textField_m24g6499: item.isQualified ? '合格' : '不合格',
      }
    })

    if (inputs.length > 0) {
      if (inputs[0]?.sheet?.gcmsReportFile) {
        measurements.push({
          textField_m24c9bpp: "GCMS报告",
          textField_m24g6498: "",
          textField_m24c9bpq: "",
          textField_m24c9bpr: "",
          textField_m24g6499: inputs[0]?.sheet.gcmsPassed === "qualified" ? '合格' : '不合格',
        })
      }
    }

    const inspectionSheet = inputs[0].sheet

    let formDataJson: any = {
      dateField_lmoh0yyn: Date.now(), // 检验日期
      textField_m24c9bpt: inspectionSheet?.code, // 检验单号
      textField_m24c9bpu: inspectionSheet?.rule?.category?.name, // 检验类型
      textField_m24c9bps: inspectionSheet?.material?.name, // 物料
      tableField_lmoh0yyo: measurements, // 检验记录
      textField_m24g649a: inspectionSheet?.lotNum, // 批次
    }

    // Conditionally add each attachment field only if the file exists
    if (inspectionSheet?.reportFile) {// 报告文件
      formDataJson.attachmentField_lmoh0yyt = [
        {
          downloadUrl: `http://121.237.179.45:3005/api/download/file?fileKey=${ encodeURIComponent(inspectionSheet.reportFile.key) }&fileName=${ encodeURIComponent(inspectionSheet.reportFile.name) }`,
          name: inspectionSheet.reportFile.name,
          url: `http://121.237.179.45:3005/api/download/file?fileKey=${ encodeURIComponent(inspectionSheet.reportFile.key) }&fileName=${ encodeURIComponent(inspectionSheet.reportFile.name) }`
        }
      ];
    }

    if (inspectionSheet?.invoiceReportFile) {// 月度发票
      formDataJson.attachmentField_m2sx5i6k = [
        {
          downloadUrl: `http://121.237.179.45:3005/api/download/file?fileKey=${ encodeURIComponent(inspectionSheet.invoiceReportFile.key) }&fileName=${ encodeURIComponent(inspectionSheet.invoiceReportFile.name) }`,
          name: inspectionSheet.invoiceReportFile.name,
          url: `http://121.237.179.45:3005/api/download/file?fileKey=${ encodeURIComponent(inspectionSheet.invoiceReportFile.key) }&fileName=${ encodeURIComponent(inspectionSheet.invoiceReportFile.name) }`
        }
      ];
    }

    if (inspectionSheet?.normalReportFile) {// 常规检测
      formDataJson.attachmentField_m2sx5i6l = [
        {
          downloadUrl: `http://121.237.179.45:3005/api/download/file?fileKey=${ encodeURIComponent(inspectionSheet.normalReportFile.key) }&fileName=${ encodeURIComponent(inspectionSheet.normalReportFile.name) }`,
          name: inspectionSheet.normalReportFile.name,
          url: `http://121.237.179.45:3005/api/download/file?fileKey=${ encodeURIComponent(inspectionSheet.normalReportFile.key) }&fileName=${ encodeURIComponent(inspectionSheet.normalReportFile.name) }`
        }
      ];
    }

    if (inspectionSheet?.qualityReportFile) {// 质保书
      formDataJson.attachmentField_m2sx5i6m = [
        {
          downloadUrl: `http://121.237.179.45:3005/api/download/file?fileKey=${ encodeURIComponent(inspectionSheet.qualityReportFile.key) }&fileName=${ encodeURIComponent(inspectionSheet.qualityReportFile.name) }`,
          name: inspectionSheet.qualityReportFile.name,
          url: `http://121.237.179.45:3005/api/download/file?fileKey=${ encodeURIComponent(inspectionSheet.qualityReportFile.key) }&fileName=${ encodeURIComponent(inspectionSheet.qualityReportFile.name) }`
        }
      ];
    }

    if (inspectionSheet?.gcmsReportFile) {// GCMS报告文件
      formDataJson.attachmentField_m2sx5i6j = [
        {
          downloadUrl: `http://121.237.179.45:3005/api/download/file?fileKey=${ encodeURIComponent(inspectionSheet.gcmsReportFile.key) }&fileName=${ encodeURIComponent(inspectionSheet.gcmsReportFile.name) }`,
          name: inspectionSheet.gcmsReportFile.name,
          url: `http://121.237.179.45:3005/api/download/file?fileKey=${ encodeURIComponent(inspectionSheet.gcmsReportFile.key) }&fileName=${ encodeURIComponent(inspectionSheet.gcmsReportFile.name) }`
        }
      ];
    }

    // convert json to string
    let formDataJsonStr = JSON.stringify(formDataJson);

    let payload =
      {
        noExecuteExpression: true,
        language: "zh_CN",
        formUuid: "FORM-857ACE8654FF4F7A942151E1FAA59CDBVYMX",
        processCode: "TPROC--QSC66681WFCP4FR379WET88XRSJT3CAZ8C42M0",
        searchCondition: "[]",
        appType: "APP_MV044H55941SP5OMR0PI",
        formDataJson: formDataJsonStr,
        systemToken: "9FA66WC107APIRYWEES29D6BYQHM23FRS812MWB",
        userId: "68282452959857472",
        departmentId: "1"
      }
    const resp = await this.api.PostResourceRequest("/v2.0/yida/processes/instances/start", payload, true)
    console.log(resp.data)

    return resp.data;
  }

  public async uploadProductionMeasurementsAudit(inputs: MomRouteProcessParameterMeasurement[]) {
    let measurements = inputs.map((item: MomRouteProcessParameterMeasurement) => {
      return {
        textField_m24c9bpp: item.dimension?.name || "", // 指标
        textField_m24c9bpq: item.lowerLimit + '~' + item.upperLimit || "",
        textField_m24c9bpr: item.value || "",
        textField_m24g6499: item.isOutSpecification ? '正常' : '超差',
      }
    })

    const workOrder = inputs[0].workOrder

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
    }

    // convert json to string
    let formDataJsonStr = JSON.stringify(formDataJson);

    let payload =
      {
        noExecuteExpression: true,
        language: "zh_CN",
        formUuid: "FORM-C615C418035C41E98BB93ED146F0135BLNQG",
        processCode: "TPROC--83766571L7JOTBP29OBTLCQH06J52329FK52MM1",
        searchCondition: "[]",
        appType: "APP_MV044H55941SP5OMR0PI",
        formDataJson: formDataJsonStr,
        systemToken: "9FA66WC107APIRYWEES29D6BYQHM23FRS812MWB",
        userId: "68282452959857472",
        departmentId: "1"
      }
    const resp = await this.api.PostResourceRequest("/v2.0/yida/processes/instances/start", payload, true)
    console.log(resp.data)

    return resp.data;
  }

  public async uploadProductionMeasurements(inputs: MomRouteProcessParameterMeasurement[]) {
    for (const input of inputs) {
      let formDataJson = {
        textField_m25kshxc: input.workOrder?.factory?.code, // 工厂
        textField_kocks567: input.workOrder?.material,// 物料
        textField_m25kshxd: input.process?.name,// 工序
        textField_m25kshxe: input.equipment?.name,// 设备
        textField_kpc0di1i: input.workReport?.lotNum,// 批次
        textField_m25kshxg: input.workOrder?.code,// 工单号
        textField_m245vk9m: input.dimension?.name,// 指标
        textField_m245vk9q: input.nominal, // 标准值
        textField_m2copt7z: input.upperLimit, // 上限
        textField_m2copt80: input.lowerLimit, // 下限
        textField_m245vk9r: input.value,// 检验值
        textField_m2copt81: input.isOutSpecification ? '正常' : '超差',
      }

      let formDataJsonStr = JSON.stringify(formDataJson);

      let payload = {
        language: "zh_CN",
        formUuid: "FORM-E53DDB7DAD344410AB53826F04074EC1LHIN",
        appType: "APP_MV044H55941SP5OMR0PI",
        formDataJson: formDataJsonStr,
        systemToken: "9FA66WC107APIRYWEES29D6BYQHM23FRS812MWB",
        userId: "68282452959857472"
      }

      const resp = await this.api.PostResourceRequest("/v1.0/yida/forms/instances", payload, true)
      console.log(resp.data)
    }
  }

  public async getAuditDetail(id: string, kind: string) {

    let payload = {}
    switch (kind) {
      case "transport":
        payload = {
          language: "zh_CN",
          formUuid: "FORM-2327400348D843CD817C3AF4164F10A43CNW",
          appType: "APP_MV044H55941SP5OMR0PI",
          systemToken: "9FA66WC107APIRYWEES29D6BYQHM23FRS812MWB",
          userId: "68282452959857472"
        }
        break;
      case "inspect":
        payload = {
          language: "zh_CN",
          formUuid: "FORM-857ACE8654FF4F7A942151E1FAA59CDBVYMX",
          appType: "APP_MV044H55941SP5OMR0PI",
          systemToken: "9FA66WC107APIRYWEES29D6BYQHM23FRS812MWB",
          userId: "68282452959857472"
        }
    }

    const resp = await this.api.GetResourceRequest(`/v2.0/yida/processes/instancesInfos/${ id }`, payload, true)
    console.log(resp.data)

    return resp.data
  }

  public async uploadTYSProductionRecords(input: MomWorkOrder) {
    let formDataJson: any = {
      textField_m25kshxc: input.factory?.name, // 工厂
      textField_kocks567: input.material?.name,// 物料
      textField_kpc0di1i: input?.lotNum,// 批号
      textField_m25kshxg: input?.code,// 工单号
      textField_m32dy4v0: input?.oilMixtureRatio,// 混油比例
      textField_m32dy4v5: input?.stirringPressure,// 搅拌压力(MP)
      textField_m32dy4v1: input?.paraffinQuantity,// 石蜡油数量(kg)
      textField_m32dy4v6: input?.tankNumber, // 搅拌罐编号,
      textField_m32dy4v2: input?.stirringTime // 搅拌时间(分钟)
    }

    if (input?.unloadingVideo) {// 卸油视频
      formDataJson.attachmentField_m32dy4va = [
        {
          downloadUrl: `http://121.237.179.45:3005/api/download/file?fileKey=${ encodeURIComponent(input?.unloadingVideo.key) }&fileName=${ encodeURIComponent(input?.unloadingVideo.name) }`,
          name: input?.unloadingVideo.name,
          url: `http://121.237.179.45:3005/api/download/file?fileKey=${ encodeURIComponent(input?.unloadingVideo.key) }&fileName=${ encodeURIComponent(input?.unloadingVideo.name) }`
        }
      ];
    }

    if (input?.dcsPicture) {// DCS液位重量照片
      formDataJson.attachmentField_m32dy4va = [
        {
          downloadUrl: `http://121.237.179.45:3005/api/download/file?fileKey=${ encodeURIComponent(input?.unloadingVideo.key) }&fileName=${ encodeURIComponent(input?.unloadingVideo.name) }`,
          name: input?.unloadingVideo.name,
          url: `http://121.237.179.45:3005/api/download/file?fileKey=${ encodeURIComponent(input?.unloadingVideo.key) }&fileName=${ encodeURIComponent(input?.unloadingVideo.name) }`
        }
      ];
    }


    let formDataJsonStr = JSON.stringify(formDataJson);

    let payload = {
      language: "zh_CN",
      formUuid: "FORM-1F700B466FE248F48DD0A16D3EF884C87V8I",
      appType: "APP_MV044H55941SP5OMR0PI",
      formDataJson: formDataJsonStr,
      systemToken: "9FA66WC107APIRYWEES29D6BYQHM23FRS812MWB",
      userId: "68282452959857472"
    }

    const resp = await this.api.PostResourceRequest("/v1.0/yida/forms/instances", payload, true)
    console.log(resp.data)
  }


}

export default YidaApi;
