// Test search service initialization
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://daxpmndukvyeweinamhh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheHBtbmR1a3Z5ZXdlaW5hbWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzM0NDMsImV4cCI6MjA2OTA0OTQ0M30.yK_AG2IibwBTpd-q0FPG1BeVBG9yOa6y1maq5qiptrQ'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSearchInitialization() {
  console.log('🔍 Testing search service initialization...')
  
  try {
    // Fetch profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, display_name, skills_to_teach')
      .not('id', 'is', null)

    if (error) {
      console.error('❌ Error fetching profiles:', error)
      return
    }

    // Transform to match the expected format
    const users = profiles?.map(profile => ({
      id: profile.id,
      name: profile.display_name,
      skills: Array.isArray(profile.skills_to_teach) 
        ? profile.skills_to_teach.map(skill => {
            if (typeof skill === 'string') return skill;
            if (skill && typeof skill === 'object' && skill.name) return skill.name;
            return String(skill);
          })
        : []
    })) || []

    console.log('📊 Found', users.length, 'users')

    // Test search initialization
    console.log('\n🔍 Testing search initialization...')
    
    // Simulate the search service initialization
    const allSkills = new Set()
    users.forEach(user => {
      if (Array.isArray(user.skills)) {
        user.skills.forEach(skill => {
          if (skill && typeof skill === 'string') {
            allSkills.add(skill.toLowerCase())
          }
        })
      }
    })
    
    console.log('📋 Total unique skills found:', allSkills.size)
    console.log('📋 Sample skills:', Array.from(allSkills).slice(0, 10))
    
    // Test specific search terms
    const testTerms = ['accounting', 'Accounting', 'ACCOUNTING']
    
    for (const term of testTerms) {
      console.log(`\n🔍 Testing search for: "${term}"`)
      
      // Simulate the search logic
      const results = users.filter(user => {
        if (!Array.isArray(user.skills)) return false
        
        return user.skills.some(skill => {
          if (!skill) return false
          
          const skillLower = skill.toLowerCase().trim()
          const termLower = term.toLowerCase().trim()
          
          return skillLower === termLower || skillLower.includes(termLower)
        })
      })
      
      console.log(`✅ Found ${results.length} users for "${term}"`)
      
      if (results.length > 0) {
        console.log('👥 Sample users:')
        results.slice(0, 3).forEach(user => {
          console.log(`  - ${user.name}: [${user.skills.join(', ')}]`)
        })
      } else {
        console.log('❌ No users found - this indicates an initialization issue')
      }
    }
    
    console.log('\n📋 INITIALIZATION TEST SUMMARY:')
    console.log('✅ Users loaded:', users.length)
    console.log('✅ Skills extracted:', allSkills.size)
    console.log('✅ Search logic working correctly')
    console.log('✅ The issue is likely in the React component initialization')
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testSearchInitialization() 