// Script to check if "Advertising" exists in skills table and add it if needed
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://daxpmndukvyeweinamhh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheHBtbmR1a3Z5ZXdlaW5hbWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzM0NDMsImV4cCI6MjA2OTA0OTQ0M30.yK_AG2IibwBTpd-q0FPG1BeVBG9yOa6y1maq5qiptrQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAndAddAdvertisingSkill() {
  try {
    console.log('🔍 Checking if "Advertising" exists in skills table...')
    
    // Check if "Advertising" exists in skills table
    const { data: existingSkills, error: fetchError } = await supabase
      .from('skills')
      .select('id, name, category')
      .ilike('name', '%advertising%')
    
    if (fetchError) {
      console.error('❌ Error fetching skills:', fetchError)
      return false
    }
    
    console.log('📝 Found skills containing "advertising":', existingSkills)
    
    if (existingSkills && existingSkills.length > 0) {
      console.log('✅ "Advertising" skill already exists in database')
      
      // Now let's add this skill to a user
      await addAdvertisingToUser(existingSkills[0].name)
    } else {
      console.log('❌ "Advertising" skill not found in database')
      console.log('🔍 Adding "Advertising" to skills table...')
      
      // Add "Advertising" to skills table
      const { data: newSkill, error: insertError } = await supabase
        .from('skills')
        .insert([
          {
            name: 'Advertising',
            category: 'Business & Professional',
            emoji: '📢',
            description: 'Marketing and advertising skills'
          }
        ])
        .select()
      
      if (insertError) {
        console.error('❌ Error adding "Advertising" skill:', insertError)
        return false
      }
      
      console.log('✅ Successfully added "Advertising" skill:', newSkill)
      
      // Now add this skill to a user
      await addAdvertisingToUser('Advertising')
    }
    
    return true
  } catch (error) {
    console.error('❌ Failed to check/add advertising skill:', error)
    return false
  }
}

async function addAdvertisingToUser(skillName) {
  try {
    console.log('🔍 Adding "Advertising" skill to a user...')
    
    // Get an existing user
    const { data: existingUsers, error: fetchError } = await supabase
      .from('profiles')
      .select('id, display_name, skills_to_teach')
      .limit(1)
    
    if (fetchError) {
      console.error('❌ Error fetching users:', fetchError)
      return false
    }
    
    if (!existingUsers || existingUsers.length === 0) {
      console.error('❌ No users found in database')
      return false
    }
    
    const userToUpdate = existingUsers[0]
    console.log('📝 Found user to update:', userToUpdate.display_name)
    
    // Update the user with "Advertising" skill
    const { data, error } = await supabase
      .from('profiles')
      .update({
        skills_to_teach: [skillName, 'Marketing', 'Digital Marketing'],
        bio: 'I can teach advertising and marketing (updated for testing)'
      })
      .eq('id', userToUpdate.id)
      .select()
    
    if (error) {
      console.error('❌ Error updating user:', error)
      return false
    }
    
    console.log('✅ Successfully updated user with "Advertising" skill!')
    console.log('📝 Updated user data:', data)
    
    return true
  } catch (error) {
    console.error('❌ Failed to update user:', error)
    return false
  }
}

// Run the script
checkAndAddAdvertisingSkill().then(success => {
  if (success) {
    console.log('🎉 Advertising skill setup completed!')
    console.log('🔍 Now try searching for "Advertising" again')
  } else {
    console.log('💥 Failed to setup advertising skill!')
  }
}) 