-- 修正库存操作单上的 inspect_state

with
    lot_qualifications as (
    select lots.id, lots.lot_num, lots.material_id, lots.source_type, lots.qualification_state, lots.is_aod, mis.result as inspection_result, mis.treatment, mis.code as inspection_sheet_code
    from base_lots as lots
    left join public.mom_inspection_sheets mis on lots.lot_num=mis.lot_num)

-- update base_lots set qualification_state='uninspected' where exists(select id from lot_qualifications where lot_qualifications.id=base_lots.id and inspection_result is null);

-- select * from base_lots
--          where exists (select id from lot_qualifications where lot_qualifications.id=base_lots.id and lot_qualifications.inspection_result is null)
--            and (qualification_state='qualified' or qualification_state='unqualified');


select miai.id, mia.created_at, mia.code as application_code, mia.operation_type, miai.lot_num, miai.bin_num, miai.inspect_state, lq.qualification_state as lot_qualification_state, lq.is_aod as lot_is_aod, lq.inspection_result as sheet_inspection_result, lq.treatment as sheet_treatment, lq.inspection_sheet_code from mom_inventory_application_items miai
         left join lot_qualifications lq on lq.material_id=miai.material_id and lq.lot_num=miai.lot_num
        left join mom_inventory_applications mia on miai.operation_id=mia.id
                          where mia.operation_type='in'
--          where
--              exists (select id from lot_qualifications where lot_qualifications.material_id=miai.material_id and lot_qualifications.lot_num=miai.lot_num and lot_qualifications.inspection_result is null)
--            and (inspect_state='qualified' or inspect_state='unqualified')
        order by miai.id;