// Script to add a test user with "Advertising" skill
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://daxpmndukvyeweinamhh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheHBtbmR1a3Z5ZXdlaW5hbWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzM0NDMsImV4cCI6MjA2OTA0OTQ0M30.yK_AG2IibwBTpd-q0FPG1BeVBG9yOa6y1maq5qiptrQ'

const supabase = createClient(supabaseUrl, supabaseKey)

// Generate a simple UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

async function addTestUser() {
  try {
    console.log('🔍 Adding test user with "Advertising" skill...')
    
    // Add a test user with "Advertising" skill
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: generateUUID(),
          display_name: 'Test Advertising User',
          bio: 'I can teach advertising and marketing',
          skills_to_teach: ['Advertising', 'Marketing', 'Digital Marketing'],
          willing_to_teach_without_return: true,
          country: 'United States',
          gender: 'Other'
        }
      ])
      .select()
    
    if (error) {
      console.error('❌ Error adding test user:', error)
      return false
    }
    
    console.log('✅ Successfully added test user!')
    console.log('📝 User data:', data)
    
    // Verify the user was added
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('id, display_name, skills_to_teach')
      .eq('display_name', 'Test Advertising User')
    
    if (verifyError) {
      console.error('❌ Error verifying user:', verifyError)
    } else {
      console.log('✅ Verified user was added:', verifyData)
    }
    
    return true
  } catch (error) {
    console.error('❌ Failed to add test user:', error)
    return false
  }
}

// Run the script
addTestUser().then(success => {
  if (success) {
    console.log('🎉 Test user added successfully!')
    console.log('🔍 Now try searching for "Advertising" again')
  } else {
    console.log('💥 Failed to add test user!')
  }
}) 