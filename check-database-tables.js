// Script to check what tables exist in the database
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://daxpmndukvyeweinamhh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheHBtbmR1a3Z5ZXdlaW5hbWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzM0NDMsImV4cCI6MjA2OTA0OTQ0M30.yK_AG2IibwBTpd-q0FPG1BeVBG9yOa6y1maq5qiptrQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabaseTables() {
  try {
    console.log('🔍 Checking what tables exist in the database...')
    
    // Try to query different tables to see what exists
    const tablesToCheck = [
      'profiles',
      'skills',
      'skill_categories',
      'chats',
      'reviews',
      'notifications',
      'invitations'
    ]
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ Table "${tableName}" does not exist or is not accessible`)
        } else {
          console.log(`✅ Table "${tableName}" exists`)
        }
      } catch (err) {
        console.log(`❌ Table "${tableName}" does not exist`)
      }
    }
    
    // Check profiles table structure
    console.log('\n🔍 Checking profiles table structure...')
    const { data: profilesSample, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (profilesError) {
      console.error('❌ Error accessing profiles table:', profilesError)
    } else if (profilesSample && profilesSample.length > 0) {
      console.log('📝 Profiles table columns:', Object.keys(profilesSample[0]))
      console.log('📝 Sample profile data:', profilesSample[0])
    }
    
    return true
  } catch (error) {
    console.error('❌ Failed to check database tables:', error)
    return false
  }
}

// Run the script
checkDatabaseTables().then(success => {
  if (success) {
    console.log('🎉 Database table check completed!')
  } else {
    console.log('💥 Failed to check database tables!')
  }
}) 