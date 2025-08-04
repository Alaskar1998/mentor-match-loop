// Test popular skills search functionality
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://daxpmndukvyeweinamhh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheHBtbmR1a3Z5ZXdlaW5hbWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzM0NDMsImV4cCI6MjA2OTA0OTQ0M30.yK_AG2IibwBTpd-q0FPG1BeVBG9yOa6y1maq5qiptrQ'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testPopularSkillsSearch() {
  console.log('🔍 Testing popular skills search functionality...')
  
  try {
    // First, get the popular skills that are shown on the homepage
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('skills_to_teach')
      .not('skills_to_teach', 'is', null)
      .neq('skills_to_teach', '[]')

    if (error) {
      console.error('❌ Error fetching profiles:', error)
      return
    }

    // Calculate popular skills (same logic as the homepage)
    const skillCounts = {}
    profiles?.forEach(profile => {
      if (profile.skills_to_teach && Array.isArray(profile.skills_to_teach)) {
        profile.skills_to_teach.forEach(skill => {
          let skillName = ''
          if (typeof skill === 'string') {
            skillName = skill
          } else if (skill && typeof skill === 'object' && skill.name) {
            skillName = skill.name
          }
          
          if (skillName && typeof skillName === 'string') {
            const normalizedSkillName = skillName.trim()
            if (normalizedSkillName) {
              skillCounts[normalizedSkillName] = (skillCounts[normalizedSkillName] || 0) + 1
            }
          }
        })
      }
    })

    // Get top 10 popular skills
    const popularSkills = Object.entries(skillCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    console.log('📊 Popular skills from database:')
    popularSkills.forEach((skill, index) => {
      console.log(`${index + 1}. ${skill.name} (${skill.count} users)`)
    })

    console.log('\n🔍 Testing search for each popular skill...')
    
    // Test search for each popular skill
    for (const skill of popularSkills) {
      console.log(`\n🔍 Testing search for: "${skill.name}"`)
      
      // Manual search logic
      const results = profiles?.filter(profile => {
        if (!Array.isArray(profile.skills_to_teach)) return false
        
        return profile.skills_to_teach.some(skillItem => {
          let skillName = ''
          if (typeof skillItem === 'string') {
            skillName = skillItem
          } else if (skillItem && typeof skillItem === 'object' && skillItem.name) {
            skillName = skillItem.name
          }
          
          if (!skillName) return false
          
          const skillLower = skillName.toLowerCase().trim()
          const searchTermLower = skill.name.toLowerCase().trim()
          
          // Test exact match
          const exactMatch = skillLower === searchTermLower
          // Test partial match
          const partialMatch = skillLower.includes(searchTermLower)
          
          return exactMatch || partialMatch
        })
      }) || []
      
      console.log(`✅ Found ${results.length} users for "${skill.name}"`)
      
      if (results.length === 0) {
        console.log(`⚠️  WARNING: No users found for "${skill.name}" - this will cause "No results found" on the website`)
      } else {
        console.log(`✅ SUCCESS: "${skill.name}" search will work correctly`)
      }
    }
    
    console.log('\n📋 SUMMARY:')
    const workingSkills = popularSkills.filter(skill => {
      const results = profiles?.filter(profile => {
        if (!Array.isArray(profile.skills_to_teach)) return false
        return profile.skills_to_teach.some(skillItem => {
          let skillName = ''
          if (typeof skillItem === 'string') {
            skillName = skillItem
          } else if (skillItem && typeof skillItem === 'object' && skillItem.name) {
            skillName = skillItem.name
          }
          if (!skillName) return false
          const skillLower = skillName.toLowerCase().trim()
          const searchTermLower = skill.name.toLowerCase().trim()
          return skillLower === searchTermLower || skillLower.includes(searchTermLower)
        })
      }) || []
      return results.length > 0
    })
    
    const brokenSkills = popularSkills.filter(skill => {
      const results = profiles?.filter(profile => {
        if (!Array.isArray(profile.skills_to_teach)) return false
        return profile.skills_to_teach.some(skillItem => {
          let skillName = ''
          if (typeof skillItem === 'string') {
            skillName = skillItem
          } else if (skillItem && typeof skillItem === 'object' && skillItem.name) {
            skillName = skillItem.name
          }
          if (!skillName) return false
          const skillLower = skillName.toLowerCase().trim()
          const searchTermLower = skill.name.toLowerCase().trim()
          return skillLower === searchTermLower || skillLower.includes(searchTermLower)
        })
      }) || []
      return results.length === 0
    })
    
    console.log(`✅ Working skills (${workingSkills.length}):`, workingSkills.map(s => s.name))
    console.log(`❌ Broken skills (${brokenSkills.length}):`, brokenSkills.map(s => s.name))
    
    if (brokenSkills.length > 0) {
      console.log('\n🔧 RECOMMENDATIONS:')
      console.log('1. Remove broken skills from popular skills list')
      console.log('2. Add more users with the missing skills')
      console.log('3. Check for case sensitivity issues')
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testPopularSkillsSearch() 