import bcrypt from "bcryptjs";
import { PrismaClient, type CompareType, type SpecDataType, type UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const normalizeAlias = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

async function main() {
  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);
  const roles: UserRole[] = ["super_admin", "admin", "manager", "marketing", "sales", "viewer"];
  for (const role of roles) {
    await prisma.user.upsert({
      where: { email: `${role}@example.com` },
      update: { passwordHash, role, name: `${role} demo user` },
      create: { email: `${role}@example.com`, passwordHash, role, name: `${role} demo user` },
    });
  }

  const brands = ["matrix", "vision", "horizon", "bowflex", "schwinn", "other"];
  for (const [index, name] of brands.entries()) {
    await prisma.brand.upsert({
      where: { name },
      update: {},
      create: {
        name,
        displayName: name,
        description: `sample / demo brand profile for ${name}`,
        tier: name === "matrix" ? "commercial" : name === "horizon" ? "home" : "mid",
        positioningStatement: `sample / demo positioning statement for ${name}`,
        coreValue: "sample / demo core value",
        productStrength: "sample / demo product strength",
        productWeakness: "sample / demo product weakness",
        salesAngle: "sample / demo sales angle",
        marketingAngle: "sample / demo marketing angle",
        sortOrder: index,
      },
    });
  }

  const categories = [
    ["treadmill", "跑步機"], ["bike", "健身車"], ["elliptical", "橢圓機"], ["rower", "划船機"], ["strength", "重訓設備"], ["accessory", "配件"], ["other", "其他"],
  ] as const;
  for (const [index, [name, displayName]] of categories.entries()) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name, displayName, sortOrder: index } });
  }
  const categoryMap = Object.fromEntries((await prisma.category.findMany()).map((c) => [c.name, c]));

  const subcategories: Record<string, string[]> = {
    treadmill: ["home_treadmill", "commercial_treadmill", "folding_treadmill"],
    bike: ["indoor_cycle", "upright_bike", "recumbent_bike"],
    elliptical: ["front_drive_elliptical", "rear_drive_elliptical", "suspension_elliptical"],
    rower: ["magnetic_rower", "air_rower", "water_rower"],
    strength: ["selectorized_upper", "selectorized_lower", "selectorized_core", "free_weight", "bench", "rack", "multi_gym", "accessory"],
    accessory: ["mat", "strap", "heart_rate_monitor", "other"],
  };
  for (const [categoryName, names] of Object.entries(subcategories)) {
    for (const [index, name] of names.entries()) {
      await prisma.subcategory.upsert({
        where: { categoryId_name: { categoryId: categoryMap[categoryName].id, name } },
        update: {},
        create: { categoryId: categoryMap[categoryName].id, name, displayName: name, sortOrder: index },
      });
    }
  }
  const subcategoryMap = Object.fromEntries((await prisma.subcategory.findMany()).map((s) => [s.name, s]));

  const attributes: Array<{ key: string; name: string; groupName: string; dataType: SpecDataType; unit?: string; isCoreSpec?: boolean; isComparable?: boolean; compareType?: CompareType }> = [
    { key: "motor_hp", name: "Motor HP", groupName: "Performance", dataType: "number", unit: "hp", isCoreSpec: true, isComparable: true, compareType: "higher_is_better" },
    { key: "speed_range", name: "Speed Range", groupName: "Performance", dataType: "range", unit: "km/h", isCoreSpec: true, isComparable: true, compareType: "range_compare" },
    { key: "incline_range", name: "Incline Range", groupName: "Performance", dataType: "range", unit: "percent", isCoreSpec: true, isComparable: true, compareType: "range_compare" },
    { key: "running_area", name: "Running Area", groupName: "Performance", dataType: "dimension", unit: "cm", isCoreSpec: true, isComparable: true, compareType: "dimension_compare" },
    { key: "cushioning_system", name: "Cushioning System", groupName: "Performance", dataType: "text", compareType: "text_only" },
    { key: "drive_system", name: "Drive System", groupName: "Performance", dataType: "text", compareType: "text_only" },
    { key: "display", name: "Display", groupName: "Console", dataType: "text" },
    { key: "workout_programs", name: "Workout Programs", groupName: "Console", dataType: "text" },
    { key: "workout_feedback", name: "Workout Feedback", groupName: "Console", dataType: "text" },
    { key: "app_compatibility", name: "App Compatibility", groupName: "Console", dataType: "text" },
    { key: "bluetooth", name: "Bluetooth", groupName: "Console", dataType: "boolean" },
    { key: "speakers", name: "Speakers", groupName: "Console", dataType: "boolean" },
    { key: "heart_rate_contact_grips", name: "Heart Rate Contact Grips", groupName: "Console", dataType: "boolean" },
    { key: "assembled_dimensions", name: "Assembled Dimensions", groupName: "Physical", dataType: "dimension", unit: "cm", isComparable: true, compareType: "dimension_compare" },
    { key: "folded_dimensions", name: "Folded Dimensions", groupName: "Physical", dataType: "dimension", unit: "cm", isComparable: true, compareType: "dimension_compare" },
    { key: "product_weight", name: "Product Weight", groupName: "Physical", dataType: "number", unit: "kg", isComparable: true, compareType: "neutral" },
    { key: "max_user_weight", name: "Max User Weight", groupName: "Physical", dataType: "number", unit: "kg", isCoreSpec: true, isComparable: true, compareType: "higher_is_better" },
    { key: "folding_system", name: "Folding System", groupName: "Physical", dataType: "text" },
    { key: "transport_wheels", name: "Transport Wheels", groupName: "Physical", dataType: "boolean" },
    { key: "resistance_type", name: "Resistance Type", groupName: "Resistance", dataType: "text", isCoreSpec: true },
    { key: "resistance_levels", name: "Resistance Levels", groupName: "Resistance", dataType: "range", isCoreSpec: true, isComparable: true, compareType: "range_compare" },
    { key: "flywheel_weight", name: "Flywheel Weight", groupName: "Resistance", dataType: "number", unit: "kg", isComparable: true, compareType: "higher_is_better" },
    { key: "seat_adjustment", name: "Seat Adjustment", groupName: "Comfort", dataType: "text", isCoreSpec: true },
    { key: "handlebar_adjustment", name: "Handlebar Adjustment", groupName: "Bike Fit", dataType: "text" },
    { key: "pedal_type", name: "Pedal Type", groupName: "Bike Fit", dataType: "text" },
    { key: "q_factor", name: "Q Factor", groupName: "Bike Fit", dataType: "number", unit: "mm" },
    { key: "seat_type", name: "Seat Type", groupName: "Comfort", dataType: "text" },
    { key: "handlebar_type", name: "Handlebar Type", groupName: "Comfort", dataType: "text" },
    { key: "backrest", name: "Backrest", groupName: "Comfort", dataType: "text", isCoreSpec: true },
    { key: "step_through_design", name: "Step-through Design", groupName: "Comfort", dataType: "boolean" },
    { key: "stride_length", name: "Stride Length", groupName: "Performance", dataType: "number", unit: "cm", isCoreSpec: true, isComparable: true, compareType: "higher_is_better" },
    { key: "step_on_height", name: "Step-on Height", groupName: "Performance", dataType: "number", unit: "cm", isCoreSpec: true, isComparable: true, compareType: "lower_is_better" },
    { key: "pedal_spacing", name: "Pedal Spacing", groupName: "Performance", dataType: "number", unit: "cm" },
    { key: "footpads", name: "Footpads", groupName: "Comfort", dataType: "text" },
    { key: "handlebars", name: "Handlebars", groupName: "Comfort", dataType: "text" },
    { key: "pedal_design", name: "Pedal Design", groupName: "Comfort", dataType: "text" },
    { key: "handle_type", name: "Handle Type", groupName: "Comfort", dataType: "text" },
    { key: "footrests", name: "Footrests", groupName: "Comfort", dataType: "text" },
    { key: "machine_function", name: "Machine Function", groupName: "Machine Info", dataType: "option", isCoreSpec: true },
    { key: "training_area", name: "Training Area", groupName: "Machine Info", dataType: "text", isCoreSpec: true },
    { key: "movement_type", name: "Movement Type", groupName: "Machine Info", dataType: "text" },
    { key: "target_muscles", name: "Target Muscles", groupName: "Machine Info", dataType: "text" },
    { key: "frame_material", name: "Frame Material", groupName: "Structure", dataType: "text", isCoreSpec: true },
    { key: "tube_size", name: "Tube Size", groupName: "Structure", dataType: "text", isCoreSpec: true, compareType: "text_only" },
    { key: "shroud_material", name: "Shroud Material", groupName: "Structure", dataType: "text" },
    { key: "finish", name: "Finish", groupName: "Structure", dataType: "text" },
    { key: "weight_stack", name: "Weight Stack", groupName: "Weight Stack", dataType: "number", unit: "kg", isCoreSpec: true, isComparable: true, compareType: "higher_is_better" },
    { key: "incremental_weight", name: "Incremental Weight", groupName: "Weight Stack", dataType: "number", unit: "kg" },
    { key: "weight_stack_dimension", name: "Weight Stack Dimension", groupName: "Weight Stack", dataType: "dimension", unit: "cm" },
    { key: "cable_or_belt", name: "Cable or Belt", groupName: "Mechanism", dataType: "text", isCoreSpec: true },
    { key: "pulley_type", name: "Pulley Type", groupName: "Mechanism", dataType: "text" },
    { key: "guide_rod", name: "Guide Rod", groupName: "Mechanism", dataType: "text" },
    { key: "arm_adjustment", name: "Arm Adjustment", groupName: "Ergonomics", dataType: "text" },
    { key: "range_of_motion_adjustment", name: "Range of Motion Adjustment", groupName: "Ergonomics", dataType: "text" },
    { key: "cup_holder", name: "Cup Holder", groupName: "Convenience", dataType: "boolean" },
    { key: "towel_hook", name: "Towel Hook", groupName: "Convenience", dataType: "boolean" },
    { key: "personal_storage", name: "Personal Storage", groupName: "Convenience", dataType: "boolean" },
    { key: "phone_holder", name: "Phone Holder", groupName: "Convenience", dataType: "boolean" },
    { key: "product_type", name: "Product Type", groupName: "Product Info", dataType: "text", isCoreSpec: true },
    { key: "grip_material", name: "Grip Material", groupName: "Material", dataType: "text" },
  ];

  for (const [sortOrder, attribute] of attributes.entries()) {
    await prisma.specAttribute.upsert({
      where: { key: attribute.key },
      update: attribute,
      create: { ...attribute, sortOrder, compareType: attribute.compareType ?? "neutral", isCoreSpec: attribute.isCoreSpec ?? false, isComparable: attribute.isComparable ?? false },
    });
  }
  const attributeMap = Object.fromEntries((await prisma.specAttribute.findMany()).map((a) => [a.key, a]));

  const aliases: Record<string, string[]> = {
    running_area: ["Running Area", "Running Surface", "Deck Size", "Running Belt Size", "Running Deck"],
    max_user_weight: ["Max User Weight", "User Weight Capacity", "Maximum User Weight", "Max Capacity", "Weight Capacity"],
    motor_hp: ["Motor", "Drive Motor", "Motor HP", "CHP", "Continuous Horsepower"],
    resistance_levels: ["Resistance Levels", "Resistance Level", "Resistance", "Levels"],
    flywheel_weight: ["Flywheel", "Flywheel Weight"],
    weight_stack: ["Weight Stack", "Stack Weight", "Weight Stack Weight"],
  };
  for (const [key, names] of Object.entries(aliases)) {
    for (const aliasName of names) {
      await prisma.specAlias.upsert({
        where: { specAttributeId_normalizedAliasName: { specAttributeId: attributeMap[key].id, normalizedAliasName: normalizeAlias(aliasName) } },
        update: { aliasName },
        create: { specAttributeId: attributeMap[key].id, aliasName, normalizedAliasName: normalizeAlias(aliasName) },
      });
    }
  }

  const templates: Array<{ key: string; name: string; category: string; subcategory?: string; required: string[]; specs: string[] }> = [
    { key: "treadmill_spec_template", name: "Treadmill Spec Template", category: "treadmill", required: ["motor_hp", "speed_range", "incline_range", "running_area", "max_user_weight"], specs: ["motor_hp", "speed_range", "incline_range", "running_area", "cushioning_system", "drive_system", "display", "workout_programs", "workout_feedback", "app_compatibility", "bluetooth", "speakers", "heart_rate_contact_grips", "assembled_dimensions", "folded_dimensions", "product_weight", "max_user_weight", "folding_system", "transport_wheels"] },
    { key: "home_treadmill_spec_template", name: "Home Treadmill Spec Template", category: "treadmill", subcategory: "home_treadmill", required: ["motor_hp", "speed_range", "incline_range", "running_area", "max_user_weight"], specs: ["motor_hp", "speed_range", "incline_range", "running_area", "cushioning_system", "drive_system", "display", "bluetooth", "assembled_dimensions", "folded_dimensions", "product_weight", "max_user_weight", "folding_system", "transport_wheels"] },
    { key: "commercial_treadmill_spec_template", name: "Commercial Treadmill Spec Template", category: "treadmill", subcategory: "commercial_treadmill", required: ["motor_hp", "speed_range", "incline_range", "running_area", "max_user_weight"], specs: ["motor_hp", "speed_range", "incline_range", "running_area", "cushioning_system", "drive_system", "display", "workout_programs", "assembled_dimensions", "product_weight", "max_user_weight"] },
    { key: "indoor_cycle_spec_template", name: "Indoor Cycle Spec Template", category: "bike", subcategory: "indoor_cycle", required: ["resistance_type", "resistance_levels", "flywheel_weight", "seat_adjustment", "max_user_weight"], specs: ["resistance_type", "resistance_levels", "flywheel_weight", "drive_system", "seat_adjustment", "handlebar_adjustment", "pedal_type", "q_factor", "seat_type", "display", "workout_feedback", "app_compatibility", "bluetooth", "assembled_dimensions", "product_weight", "max_user_weight", "transport_wheels"] },
    { key: "upright_bike_spec_template", name: "Upright Bike Spec Template", category: "bike", subcategory: "upright_bike", required: ["resistance_type", "resistance_levels", "seat_adjustment", "max_user_weight"], specs: ["resistance_type", "resistance_levels", "flywheel_weight", "seat_type", "seat_adjustment", "handlebar_type", "display", "workout_programs", "workout_feedback", "app_compatibility", "bluetooth", "assembled_dimensions", "product_weight", "max_user_weight"] },
    { key: "recumbent_bike_spec_template", name: "Recumbent Bike Spec Template", category: "bike", subcategory: "recumbent_bike", required: ["resistance_type", "resistance_levels", "seat_adjustment", "backrest", "max_user_weight"], specs: ["resistance_type", "resistance_levels", "flywheel_weight", "seat_type", "backrest", "seat_adjustment", "step_through_design", "handlebar_type", "display", "workout_programs", "workout_feedback", "app_compatibility", "bluetooth", "assembled_dimensions", "product_weight", "max_user_weight"] },
    { key: "elliptical_spec_template", name: "Elliptical Spec Template", category: "elliptical", required: ["stride_length", "resistance_levels", "incline_range", "max_user_weight"], specs: ["stride_length", "resistance_type", "resistance_levels", "incline_range", "flywheel_weight", "step_on_height", "pedal_spacing", "footpads", "handlebars", "pedal_design", "display", "workout_programs", "workout_feedback", "app_compatibility", "bluetooth", "assembled_dimensions", "product_weight", "max_user_weight", "transport_wheels"] },
    { key: "rower_spec_template", name: "Rower Spec Template", category: "rower", required: ["resistance_type", "resistance_levels", "max_user_weight", "assembled_dimensions"], specs: ["resistance_type", "resistance_levels", "seat_type", "handle_type", "footrests", "display", "workout_feedback", "app_compatibility", "bluetooth", "assembled_dimensions", "folded_dimensions", "product_weight", "max_user_weight", "transport_wheels"] },
    { key: "selectorized_upper_spec_template", name: "Selectorized Upper Spec Template", category: "strength", subcategory: "selectorized_upper", required: ["machine_function", "training_area", "weight_stack", "tube_size", "cable_or_belt", "assembled_dimensions"], specs: ["machine_function", "training_area", "movement_type", "target_muscles", "frame_material", "tube_size", "shroud_material", "finish", "weight_stack", "incremental_weight", "weight_stack_dimension", "cable_or_belt", "pulley_type", "guide_rod", "seat_adjustment", "arm_adjustment", "handle_type", "range_of_motion_adjustment", "cup_holder", "towel_hook", "personal_storage", "phone_holder", "assembled_dimensions", "product_weight", "max_user_weight"] },
    { key: "selectorized_lower_spec_template", name: "Selectorized Lower Spec Template", category: "strength", subcategory: "selectorized_lower", required: ["machine_function", "training_area", "weight_stack", "tube_size", "cable_or_belt", "assembled_dimensions"], specs: ["machine_function", "training_area", "movement_type", "target_muscles", "frame_material", "tube_size", "weight_stack", "cable_or_belt", "seat_adjustment", "assembled_dimensions", "product_weight", "max_user_weight"] },
    { key: "selectorized_core_spec_template", name: "Selectorized Core Spec Template", category: "strength", subcategory: "selectorized_core", required: ["machine_function", "training_area", "weight_stack", "tube_size", "cable_or_belt", "assembled_dimensions"], specs: ["machine_function", "training_area", "movement_type", "target_muscles", "frame_material", "tube_size", "weight_stack", "cable_or_belt", "seat_adjustment", "assembled_dimensions", "product_weight", "max_user_weight"] },
    { key: "strength_free_weight_spec_template", name: "Strength Free Weight Spec Template", category: "strength", subcategory: "free_weight", required: ["product_type", "frame_material", "product_weight"], specs: ["product_type", "training_area", "target_muscles", "frame_material", "finish", "grip_material", "assembled_dimensions", "product_weight", "max_user_weight"] },
    { key: "bench_spec_template", name: "Bench Spec Template", category: "strength", subcategory: "bench", required: ["product_type", "frame_material", "product_weight"], specs: ["product_type", "training_area", "frame_material", "finish", "assembled_dimensions", "product_weight", "max_user_weight"] },
    { key: "rack_spec_template", name: "Rack Spec Template", category: "strength", subcategory: "rack", required: ["product_type", "frame_material", "product_weight"], specs: ["product_type", "training_area", "frame_material", "finish", "assembled_dimensions", "product_weight", "max_user_weight"] },
    { key: "accessory_spec_template", name: "Accessory Spec Template", category: "accessory", required: ["product_type"], specs: ["product_type", "assembled_dimensions", "product_weight"] },
  ];

  for (const [sortOrder, template] of templates.entries()) {
    const created = await prisma.specTemplate.upsert({
      where: { key: template.key },
      update: { name: template.name, categoryId: categoryMap[template.category].id, subcategoryId: template.subcategory ? subcategoryMap[template.subcategory].id : null },
      create: { key: template.key, name: template.name, categoryId: categoryMap[template.category].id, subcategoryId: template.subcategory ? subcategoryMap[template.subcategory].id : null, description: `sample / demo ${template.name}`, sortOrder },
    });
    for (const [index, key] of template.specs.entries()) {
      await prisma.specTemplateAttribute.upsert({
        where: { specTemplateId_specAttributeId: { specTemplateId: created.id, specAttributeId: attributeMap[key].id } },
        update: { isRequired: template.required.includes(key), isCoreSpec: template.required.includes(key) || Boolean(attributeMap[key].isCoreSpec), sortOrder: index },
        create: { specTemplateId: created.id, specAttributeId: attributeMap[key].id, isRequired: template.required.includes(key), isCoreSpec: template.required.includes(key) || Boolean(attributeMap[key].isCoreSpec), sortOrder: index },
      });
    }
  }

  for (const category of Object.values(categoryMap)) {
    for (const [index, band] of ["Entry", "Mid", "Premium", "Commercial"].entries()) {
      await prisma.priceBand.create({ data: { name: band, categoryId: category.id, market: "TW", currency: "TWD", minPrice: index * 50000, maxPrice: (index + 1) * 50000 - 1, positioningTier: band.toLowerCase(), description: `sample / demo ${category.name} ${band} price band`, sortOrder: index } }).catch(() => undefined);
    }
  }

  const brandMap = Object.fromEntries((await prisma.brand.findMany()).map((b) => [b.name, b]));
  const templateMap = Object.fromEntries((await prisma.specTemplate.findMany()).map((t) => [t.key, t]));
  const demoProducts = [
    ["matrix", "treadmill", "commercial_treadmill", "treadmill_spec_template", "Matrix Demo Treadmill X1", "MTX-DEMO-T1", "commercial"],
    ["matrix", "strength", "selectorized_upper", "selectorized_upper_spec_template", "Matrix Demo Chest Press", "MTX-DEMO-CP", "premium", "chest_press"],
    ["matrix", "elliptical", "front_drive_elliptical", "elliptical_spec_template", "Matrix Demo Elliptical", "MTX-DEMO-E1", "commercial"],
    ["vision", "bike", "upright_bike", "upright_bike_spec_template", "Vision Demo Bike V1", "VIS-DEMO-B1", "mid"],
    ["vision", "strength", "selectorized_upper", "selectorized_upper_spec_template", "Vision Demo Chest Press", "VIS-DEMO-CP", "mid", "chest_press"],
    ["vision", "strength", "selectorized_lower", "selectorized_lower_spec_template", "Vision Demo Leg Press", "VIS-DEMO-LP", "mid", "leg_press"],
    ["horizon", "treadmill", "home_treadmill", "home_treadmill_spec_template", "Horizon Demo Treadmill H1", "HOR-DEMO-T1", "entry"],
    ["horizon", "bike", "indoor_cycle", "indoor_cycle_spec_template", "Horizon Demo Indoor Cycle H1", "HOR-DEMO-IC1", "entry"],
    ["bowflex", "strength", "free_weight", "strength_free_weight_spec_template", "Bowflex Demo Trainer B1", "BOW-DEMO-TR1", "mid", "functional_trainer"],
    ["schwinn", "bike", "recumbent_bike", "recumbent_bike_spec_template", "Schwinn Demo Bike S1", "SCH-DEMO-B1", "entry"],
    ["other", "accessory", "mat", "accessory_spec_template", "Other Demo Accessory O1", "OTH-DEMO-A1", "entry"],
  ] as const;

  for (const [index, row] of demoProducts.entries()) {
    const [brand, category, subcategory, template, modelName, modelCode, tier, machineFunction] = row;
    const product = await prisma.product.upsert({
      where: { slug: modelName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") },
      update: {},
      create: {
        brandId: brandMap[brand].id,
        categoryId: categoryMap[category].id,
        subcategoryId: subcategoryMap[subcategory].id,
        specTemplateId: templateMap[template].id,
        modelName,
        modelCode,
        slug: modelName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        shortDescription: `sample / demo product only: ${modelName}`,
        longDescription: `sample / demo product data for UI testing. Do not treat this as real product specification.` ,
        status: index % 3 === 0 ? "upcoming" : "active",
        lifecycleStage: "new",
        market: "TW",
        currency: "TWD",
        msrp: 48000 + index * 15000,
        dealerPrice: 38000 + index * 12000,
        targetCustomer: tier,
        useCase: "sample / demo use case",
        positioningTier: tier,
        machineFunction: machineFunction ?? null,
        completenessScore: 75,
      },
    });
    await prisma.productFeature.create({ data: { productId: product.id, title: "sample / demo feature", description: "Demo data only", sortOrder: 1 } }).catch(() => undefined);
    await prisma.marketingContent.upsert({ where: { productId: product.id }, update: {}, create: { productId: product.id, oneLineSellingPoint: "sample / demo one-line selling point", keySellingPoints: ["sample", "demo"], targetAudience: "sample / demo audience" } });
    await prisma.salesContent.upsert({ where: { productId: product.id }, update: {}, create: { productId: product.id, salesBrief: "sample / demo sales brief", recommendationScript: "sample / demo recommendation script", faq: [{ question: "Is this real data?", answer: "No, this is sample / demo data." }] } });
  }

  await prisma.auditLog.create({ data: { action: "seed_demo_data", entityType: "system", newValue: { note: "sample / demo data seeded" } } });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
