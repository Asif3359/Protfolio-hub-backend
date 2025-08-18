#!/usr/bin/env node

const { generateTrainingData, generateExtendedTrainingData, saveTrainingData } = require('./trainingDataGenerator');

// console.log('🎯 Skill Question Generator - Training Data Statistics');
// console.log('=' .repeat(60));

// Generate basic training data
const basicData = generateTrainingData();
// console.log(`📊 Basic Training Data:`);
// console.log(`   Total examples: ${basicData.length}`);
// console.log(`   Skills covered: ${new Set(basicData.map(item => item.skill)).size}`);

// Generate extended training data
const extendedData = generateExtendedTrainingData();
// console.log(`\n📈 Extended Training Data:`);
// console.log(`   Total examples: ${extendedData.length}`);
// console.log(`   Skills covered: ${new Set(extendedData.map(item => item.skill)).size}`);

// Show skills breakdown
const skillCounts = {};
const categoryCounts = {};
const proficiencyCounts = {};

extendedData.forEach(item => {
  // Count skills
  skillCounts[item.skill] = (skillCounts[item.skill] || 0) + 1;
  
  // Count categories
  categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  
  // Count proficiency levels
  proficiencyCounts[item.proficiency] = (proficiencyCounts[item.proficiency] || 0) + 1;
});

// console.log(`\n🏷️  Skills Breakdown:`);
Object.entries(skillCounts).forEach(([skill, count]) => {
  // console.log(`   ${skill}: ${count} examples`);
});

// console.log(`\n📂 Categories Breakdown:`);
Object.entries(categoryCounts).forEach(([category, count]) => {
  // console.log(`   ${category}: ${count} examples`);
});

// console.log(`\n📊 Proficiency Levels Breakdown:`);
Object.entries(proficiencyCounts).forEach(([proficiency, count]) => {
  // console.log(`   ${proficiency}: ${count} examples`);
});

// Save both datasets
// console.log(`\n💾 Saving training data...`);
saveTrainingData(basicData, 'basic_training_data.json');
saveTrainingData(extendedData, 'extended_training_data.json');

// console.log(`\n✅ Training data generated successfully!`);
// console.log(`\n📁 Files created:`);
// console.log(`   - data/basic_training_data.json (${basicData.length} examples)`);
// console.log(`   - data/extended_training_data.json (${extendedData.length} examples)`);

// console.log(`\n🚀 Next steps:`);
// console.log(`   1. Use extended_training_data.json for fine-tuning (recommended)`);
// console.log(`   2. Run: cd ml && python fine_tune_model.py`);
// console.log(`   3. The model will be trained on ${extendedData.length} examples`);

// Show sample data structure
// console.log(`\n📋 Sample Training Example:`);
if (extendedData.length > 0) {
  const sample = extendedData[0];
  // console.log(JSON.stringify(sample, null, 2));
}
