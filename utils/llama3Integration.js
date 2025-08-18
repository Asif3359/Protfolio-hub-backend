/**
 * Llama 3 Integration for Portfolio Hub
 * Provides functions to interact with the Llama 3 question generation service
 */

const axios = require('axios');

class Llama3Integration {
    constructor(baseURL = 'http://localhost:8002') {
        this.baseURL = baseURL;
        this.apiClient = axios.create({
            baseURL: this.baseURL,
            timeout: 60000, // 60 seconds timeout for generation
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Check if the Llama 3 service is healthy
     * @returns {Promise<boolean>}
     */
    async checkHealth() {
        try {
            const response = await this.apiClient.get('/health');
            return response.data.ollama_connected;
        } catch (error) {
            console.error('Health check failed:', error.message);
            return false;
        }
    }

    /**
     * Generate questions for a single skill
     * @param {string} skill - Skill name
     * @param {string} category - Skill category
     * @param {number} numQuestions - Number of questions to generate
     * @returns {Promise<Object>}
     */
    async generateQuestions(skill, category, numQuestions = 10) {
        try {
            const response = await this.apiClient.post('/generate-questions', {
                skill,
                category,
                num_questions: numQuestions
            });
            return response.data;
        } catch (error) {
            console.error(`Failed to generate questions for ${skill}:`, error.message);
            throw new Error(`Failed to generate questions: ${error.message}`);
        }
    }

    /**
     * Generate questions for multiple skills
     * @param {Array} skills - Array of skill objects with name and category
     * @param {number} numQuestions - Number of questions per skill
     * @returns {Promise<Array>}
     */
    async generateMultipleSkills(skills, numQuestions = 10) {
        try {
            const skillsData = skills.map(skill => ({
                skill: skill.name,
                category: skill.category,
                num_questions: numQuestions
            }));

            const response = await this.apiClient.post('/generate-multiple-skills', skillsData);
            return response.data.results;
        } catch (error) {
            console.error('Failed to generate multiple skills:', error.message);
            throw new Error(`Failed to generate multiple skills: ${error.message}`);
        }
    }

    /**
     * Generate questions for common programming skills
     * @param {number} numQuestions - Number of questions per skill
     * @returns {Promise<Array>}
     */
    async generateCommonSkills(numQuestions = 10) {
        const commonSkills = [
            { name: 'JavaScript', category: 'Programming' },
            { name: 'Python', category: 'Programming' },
            { name: 'React', category: 'Frontend Development' },
            { name: 'Node.js', category: 'Backend Development' },
            { name: 'MongoDB', category: 'Database' },
            { name: 'Git', category: 'Version Control' },
            { name: 'Docker', category: 'DevOps' },
            { name: 'AWS', category: 'Cloud Computing' }
        ];

        return await this.generateMultipleSkills(commonSkills, numQuestions);
    }

    /**
     * Generate questions and save to training data
     * @param {string} skill - Skill name
     * @param {string} category - Skill category
     * @param {number} numQuestions - Number of questions
     * @returns {Promise<Object>}
     */
    async generateAndSaveQuestions(skill, category, numQuestions = 10) {
        try {
            const questions = await this.generateQuestions(skill, category, numQuestions);
            
            // Save to training data (you can customize this path)
            const fs = require('fs').promises;
            const path = require('path');
            
            const trainingDataPath = path.join(__dirname, '../data', `${skill.toLowerCase()}_llama3_questions.json`);
            
            await fs.writeFile(trainingDataPath, JSON.stringify(questions, null, 2));
            
            // console.log(`✅ Questions saved to: ${trainingDataPath}`);
            
            return {
                success: true,
                questions,
                filePath: trainingDataPath
            };
        } catch (error) {
            console.error('Failed to generate and save questions:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Export the class
module.exports = Llama3Integration;

// Example usage (if run directly)
if (require.main === module) {
    async function testLlama3Integration() {
        const llama3 = new Llama3Integration();
        
        // console.log('🧪 Testing Llama 3 Integration...');
        
        // Check health
        const isHealthy = await llama3.checkHealth();
        // console.log(`Health check: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
        
        if (!isHealthy) {
            // console.log('❌ Llama 3 service is not available. Please start the service first.');
            return;
        }
        
        // Generate questions for a single skill
        try {
            // console.log('\n🔄 Generating questions for JavaScript...');
            const questions = await llama3.generateQuestions('JavaScript', 'Programming', 3);
            // console.log(`✅ Generated ${questions.questions.length} questions for JavaScript`);
            
            // Generate questions for multiple skills
            // console.log('\n🔄 Generating questions for multiple skills...');
            const results = await llama3.generateMultipleSkills([
                { name: 'Python', category: 'Programming' },
                { name: 'React', category: 'Frontend Development' }
            ], 2);
            
            //  console.log('✅ Multiple skills generation results:');
            results.forEach(result => {
                console.log(`  - ${result.skill}: ${result.status} (${result.questions_count || 0} questions)`);
            });
            
        } catch (error) {
            // console.error('❌ Test failed:', error.message);
        }
    }
    
    testLlama3Integration();
}
