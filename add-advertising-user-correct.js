// Script to add a user with "Advertising" skill using the correct object format
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://daxpmndukvyeweinamhh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheHBtbmR1a3Z5ZXdlaW5hbWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzM0NDMsImV4cCI6MjA2OTA0OTQ0M30.yK_AG2IibwBTpd-q0FPG1BeVBG9yOa6y1maq5qiptrQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function addAdvertisingUser() {
  try {
    console.log('🔍 Adding user with "Advertising" skill using correct format...')
    
    // Get an existing user to update
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
    
    // Update the user with "Advertising" skill using the correct object format
    const { data, error } = await supabase
      .from('profiles')
      .update({
        skills_to_teach: [
          {
            name: 'Advertising',
            level: 'Expert',
            category: 'Business & Professional',
            description: 'Marketing and advertising skills'
          },
          {
            name: 'Marketing',
            level: 'Expert',
            category: 'Business & Professional',
            description: 'Digital and traditional marketing'
          },
          {
            name: 'Digital Marketing',
            level: 'Expert',
            category: 'Business & Professional',
            description: 'Online marketing strategies'
          }
        ],
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
    
    // Verify the update
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('id, display_name, skills_to_teach')
      .eq('id', userToUpdate.id)
    
    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError)
    } else {
      console.log('✅ Verified user was updated:', verifyData)
      
      // Check if "Advertising" skill is there
      const user = verifyData[0]
      if (user.skills_to_teach && Array.isArray(user.skills_to_teach)) {
        const advertisingSkill = user.skills_to_teach.find(skill => 
          skill.name && skill.name.toLowerCase().includes('advertising')
        )
        if (advertisingSkill) {
          console.log('🎯 Found "Advertising" skill:', advertisingSkill)
        } else {
          console.log('❌ "Advertising" skill not found in updated user')
        }
      }
    }
    
    return true
  } catch (error) {
    console.error('❌ Failed to update user:', error)
    return false
  }
}

// Run the script
addAdvertisingUser().then(success => {
  if (success) {
    console.log('🎉 User updated successfully with "Advertising" skill!')
    console.log('🔍 Now try searching for "Advertising" again')
  } else {
    console.log('💥 Failed to update user!')
  }
}) 