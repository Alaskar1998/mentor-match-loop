// Debug search functionality
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://daxpmndukvyeweinamhh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheHBtbmR1a3Z5ZXdlaW5hbWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzM0NDMsImV4cCI6MjA2OTA0OTQ0M30.yK_AG2IibwBTpd-q0FPG1BeVBG9yOa6y1maq5qiptrQ'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugSearch() {
  console.log('🔍 Debugging search functionality...')
  
  try {
    // Fetch all profiles with skills
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, display_name, skills_to_teach')
      .not('id', 'is', null)

    if (error) {
      console.error('❌ Error fetching profiles:', error)
      return
    }

    console.log('📊 Found', profiles?.length || 0, 'profiles')
    
    // Test exact search terms
    const testTerms = ['Advertising', 'advertising', 'ADVERTISING', 'Marketing', 'marketing', 'Cooking', 'cooking']
    
    for (const term of testTerms) {
      console.log(`\n🔍 Testing search term: "${term}"`)
      
      // Manual search logic to debug
      const results = profiles?.filter(profile => {
        if (!Array.isArray(profile.skills_to_teach)) {
          console.log(`User ${profile.display_name} has no skills array`)
          return false
        }
        
        return profile.skills_to_teach.some(skill => {
          // Handle different skill formats
          let skillName = ''
          if (typeof skill === 'string') {
            skillName = skill
          } else if (skill && typeof skill === 'object' && skill.name) {
            skillName = skill.name
          } else {
            return false
          }
          
          const skillLower = skillName.toLowerCase()
          const termLower = term.toLowerCase()
          
          console.log(`  Comparing: "${skillName}" (${skillLower}) with "${term}" (${termLower})`)
          console.log(`  Exact match: ${skillLower === termLower}`)
          console.log(`  Includes: ${skillLower.includes(termLower)}`)
          
          return skillLower === termLower || skillLower.includes(termLower)
        })
      }) || []
      
      console.log(`✅ Found ${results.length} users for "${term}"`)
      results.forEach(user => {
        console.log(`  - ${user.display_name}: [${user.skills_to_teach.join(', ')}]`)
      })
    }
    
    // Check what skills are actually in the database
    console.log('\n📋 All skills in database:')
    const allSkills = new Set()
    profiles?.forEach(profile => {
      if (Array.isArray(profile.skills_to_teach)) {
        profile.skills_to_teach.forEach(skill => {
          if (typeof skill === 'string') {
            allSkills.add(skill)
          } else if (skill && typeof skill === 'object' && skill.name) {
            allSkills.add(skill.name)
          }
        })
      }
    })
    
    const sortedSkills = Array.from(allSkills).sort()
    console.log('Skills found:', sortedSkills)
    
    // Check for specific problematic skills
    const advertisingSkills = sortedSkills.filter(skill => 
      skill.toLowerCase().includes('advertising')
    )
    console.log('Skills containing "advertising":', advertisingSkills)
    
    const marketingSkills = sortedSkills.filter(skill => 
      skill.toLowerCase().includes('marketing')
    )
    console.log('Skills containing "marketing":', marketingSkills)
    
  } catch (error) {
    console.error('💥 Debug failed:', error)
  }
}

debugSearch() 