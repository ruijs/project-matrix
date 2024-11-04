function main(ctx) {
// 机器信息
// ctx.Machine
// 当前字段数据
// ctx.RuntimeFields
// 当前上报属性数据
// ctx.AttributeData
//   1112201005 华谷发泡机
//   1112201016 沈阳发泡机
  if (ctx.Machine.Code === "1212305041" || ctx.Machine.Code === "2612305007") {
    resp = ctx.DoRequest({
      method: "POST",
      url: "http://10.0.0.3:3005/api/app/iotCallback",
      timeout: 10,
      responseType: "json",
      data: {
        machine: ctx.Machine.Code,
        runtimeFields: ctx.RuntimeFields,
        attributeData: ctx.AttributeData,
        activityFields: ctx.ActivityFields
      }
    });
  }
}
