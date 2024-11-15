function main(ctx) {
// 机器信息
// ctx.Machine
// 当前字段数据
// ctx.RuntimeFields
// 当前上报属性数据
// ctx.AttributeData
//   1212305041 华谷注塑机
//   2612305007 沈阳注塑机
  if (ctx.Machine.Code === "HT_2_6" || ctx.Machine.Code === "HT_2_7") {
    state = "stopped";
    if (ctx.AttributeData.Value === true) {
      state = "running";
    } else if (ctx.AttributeData.Value === false) {
      state = "stopped";
    }
    newRuntimeFields = ctx.UpdateMachineFields({"state": state});
  }

  console.log(ctx.Machine.Code, ctx.AttributeData.Value, state);
}
