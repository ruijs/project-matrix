with abnormal_sheets as (with sheet_measurement_counts as (select sheet_id, count(sheet_id) as measurement_count
                                                           from mom_inspection_measurements as m
                                                           where (m.qualitative_value is not null or m.quantitative_value is not null)
                                                           group by sheet_id)
                         select s.id,
                                s.code,
                                mt.code          as material_code,
                                mt.name          as material_name,
                                mt.specification as material_spec,
                                s.lot_num,
                                mc.measurement_count,
                                s.result,
                                s.state,
                                s.approval_state
                         from mom_inspection_sheets as s
                                  left join sheet_measurement_counts as mc on s.id = mc.sheet_id
                                  left join base_materials as mt on s.material_id = mt.id
                         where (mc.measurement_count is null or mc.measurement_count = 0)
                           and (s.result = 'qualified' or s.result = 'unqualified'))
update mom_inspection_sheets set result=null where exists (select id from abnormal_sheets where abnormal_sheets.id=mom_inspection_sheets.id);
