// Script to check the actual structure of skills in the database
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://daxpmndukvyeweinamhh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheHBtbmR1a3Z5ZXdlaW5hbWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzM0NDMsImV4cCI6MjA2OTA0OTQ0M30.yK_AG2IibwBTpd-q0FPG1BeVBG9yOa6y1maq5qiptrQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSkillsStructure() {
  try {
    console.log('🔍 Checking skills structure in database...')
    
    // Get users with skills
    const { data: users, error: fetchError } = await supabase
      .from('profiles')
      .select('id, display_name, skills_to_teach')
      .not('skills_to_teach', 'eq', '[]')
      .limit(5)
    
    if (fetchError) {
      console.error('❌ Error fetching users:', fetchError)
      return false
    }
    
    console.log('📝 Found', users?.length || 0, 'users with skills')
    
    users?.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}: ${user.display_name}`)
      console.log('📝 Skills data:', user.skills_to_teach)
      console.log('📝 Skills type:', typeof user.skills_to_teach)
      console.log('📝 Is array:', Array.isArray(user.skills_to_teach))
      
      if (Array.isArray(user.skills_to_teach)) {
        user.skills_to_teach.forEach((skill, skillIndex) => {
          console.log(`  Skill ${skillIndex + 1}:`, skill)
          console.log(`  Skill type:`, typeof skill)
          if (typeof skill === 'object') {
            console.log(`  Skill keys:`, Object.keys(skill))
          }
        })
      }
    })
    
    return true
  } catch (error) {
    console.error('❌ Failed to check skills structure:', error)
    return false
  }
}

// Run the script
checkSkillsStructure().then(success => {
  if (success) {
    console.log('🎉 Skills structure check completed!')
  } else {
    console.log('💥 Failed to check skills structure!')
  }
}) 