// Test script to check Supabase connection
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://daxpmndukvyeweinamhh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheHBtbmR1a3Z5ZXdlaW5hbWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzM0NDMsImV4cCI6MjA2OTA0OTQ0M30.yK_AG2IibwBTpd-q0FPG1BeVBG9yOa6y1maq5qiptrQ'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...')
    
    // Test 1: Check if we can connect to the database
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .limit(5)
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError)
      return false
    }
    
    console.log('✅ Successfully connected to Supabase!')
    console.log('📊 Found', profiles?.length || 0, 'profiles')
    
    // Test 2: Check for users with skills
    const { data: usersWithSkills, error: skillsError } = await supabase
      .from('profiles')
      .select('id, display_name, skills_to_teach')
      .not('skills_to_teach', 'is', null)
    
    if (skillsError) {
      console.error('❌ Error fetching users with skills:', skillsError)
    } else {
      console.log('📊 Found', usersWithSkills?.length || 0, 'users with skills')
      
      // Check what skills are actually in the database
      const allSkills = new Set()
      const usersWithActualSkills = []
      
      usersWithSkills?.forEach(user => {
        if (user.skills_to_teach && Array.isArray(user.skills_to_teach)) {
          user.skills_to_teach.forEach(skill => {
            if (skill && typeof skill === 'string' && skill.trim()) {
              allSkills.add(skill.trim())
              usersWithActualSkills.push({
                name: user.display_name,
                skill: skill.trim()
              })
            }
          })
        }
      })
      
      console.log('🎯 Found', allSkills.size, 'unique skills in database:')
      console.log('📝 Skills list:', Array.from(allSkills).sort())
      
      console.log('👥 Users with actual skills:', usersWithActualSkills.length)
      if (usersWithActualSkills.length > 0) {
        console.log('📝 First 10 users with skills:', usersWithActualSkills.slice(0, 10))
      }
      
      // Check for "Advertising" specifically
      const advertisingUsers = usersWithActualSkills.filter(u => 
        u.skill.toLowerCase().includes('advertising')
      )
      console.log('🎯 Found', advertisingUsers.length, 'users with "Advertising" skill')
      if (advertisingUsers.length > 0) {
        console.log('📝 Users with Advertising:', advertisingUsers)
      }
    }
    
    return true
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    return false
  }
}

// Run the test
testConnection().then(success => {
  if (success) {
    console.log('🎉 Supabase connection is working properly!')
  } else {
    console.log('💥 Supabase connection failed!')
  }
}) 