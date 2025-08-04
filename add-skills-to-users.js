// Script to add skills directly to user profiles
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://daxpmndukvyeweinamhh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheHBtbmR1a3Z5ZXdlaW5hbWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzM0NDMsImV4cCI6MjA2OTA0OTQ0M30.yK_AG2IibwBTpd-q0FPG1BeVBG9yOa6y1maq5qiptrQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function addSkillsToUsers() {
  try {
    console.log('🔍 Adding skills to users...')
    
    // Get existing users
    const { data: users, error: fetchError } = await supabase
      .from('profiles')
      .select('id, display_name, skills_to_teach')
      .limit(10)
    
    if (fetchError) {
      console.error('❌ Error fetching users:', fetchError)
      return false
    }
    
    console.log('📝 Found', users?.length || 0, 'users to update')
    
    // Add different skills to different users
    const skillSets = [
      ['Advertising', 'Marketing', 'Digital Marketing'],
      ['JavaScript', 'React', 'Web Development'],
      ['Python', 'Data Science', 'Machine Learning'],
      ['Photography', 'Photo Editing', 'Creative Arts'],
      ['Cooking', 'Baking', 'Culinary Arts'],
      ['Guitar', 'Music Theory', 'Performance'],
      ['Fitness', 'Yoga', 'Wellness'],
      ['Writing', 'Content Creation', 'Copywriting'],
      ['Business Strategy', 'Entrepreneurship', 'Leadership'],
      ['Language Teaching', 'English', 'Communication']
    ]
    
    for (let i = 0; i < Math.min(users?.length || 0, skillSets.length); i++) {
      const user = users[i]
      const skills = skillSets[i]
      
      console.log(`📝 Updating user ${i + 1}: ${user.display_name} with skills: ${skills.join(', ')}`)
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          skills_to_teach: skills,
          bio: `I can teach ${skills.join(', ')} (updated for testing)`
        })
        .eq('id', user.id)
        .select()
      
      if (error) {
        console.error(`❌ Error updating user ${user.display_name}:`, error)
      } else {
        console.log(`✅ Successfully updated user ${user.display_name}`)
      }
    }
    
    // Verify the updates
    console.log('\n🔍 Verifying updates...')
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('id, display_name, skills_to_teach')
      .not('skills_to_teach', 'eq', '[]')
    
    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError)
    } else {
      console.log('✅ Found', verifyData?.length || 0, 'users with skills')
      verifyData?.forEach(user => {
        console.log(`📝 ${user.display_name}: [${user.skills_to_teach.join(', ')}]`)
      })
    }
    
    return true
  } catch (error) {
    console.error('❌ Failed to add skills to users:', error)
    return false
  }
}

// Run the script
addSkillsToUsers().then(success => {
  if (success) {
    console.log('🎉 Skills added to users successfully!')
    console.log('🔍 Now try searching for "Advertising" again')
  } else {
    console.log('💥 Failed to add skills to users!')
  }
}) 