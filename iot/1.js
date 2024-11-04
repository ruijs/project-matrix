function main(ctx) {
// 机器信息
// ctx.Machine
// 当前字段数据
// ctx.RuntimeFields
// 当前上报属性数据
// ctx.AttributeData
//   1112201005 华谷发泡机
//   1112201016 沈阳发泡机
  if (ctx.Machine.Code === "1112201005" || ctx.Machine.Code === "1112201016") {
    state = "idle";
    if (ctx.AttributeData.Value > 22.3) {
      state = "running";
    } else if (ctx.AttributeData.Value < 22.3) {
      state = "stopped";
    }
    newRuntimeFields = ctx.UpdateMachineFields({"state": state});
  }

  console.log(ctx.Machine.Code)
}
