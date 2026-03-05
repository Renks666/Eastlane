-- Optional cleanup: keep only editable numeric subset for eastlane_tariffs payload.
-- Run manually if you want to remove legacy text fields from existing DB records.

update site_sections
set payload = jsonb_build_object(
  'tiers',
  jsonb_build_array(
    jsonb_build_object(
      'id', 'retail',
      'minItems', coalesce((payload #>> '{tiers,0,minItems}')::int, 1),
      'serviceFeeCny', coalesce((payload #>> '{tiers,0,serviceFeeCny}')::numeric, 50),
      'serviceFeeRubApprox', coalesce((payload #>> '{tiers,0,serviceFeeRubApprox}')::numeric, 600)
    ),
    jsonb_build_object(
      'id', 'wholesale',
      'minItems', coalesce((payload #>> '{tiers,1,minItems}')::int, 5),
      'serviceFeeCny', coalesce((payload #>> '{tiers,1,serviceFeeCny}')::numeric, 30),
      'serviceFeeRubApprox', coalesce((payload #>> '{tiers,1,serviceFeeRubApprox}')::numeric, 360)
    )
  )
)
where section_key = 'eastlane_tariffs';
