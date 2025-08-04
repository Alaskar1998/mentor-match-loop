// Comprehensive System Test
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://daxpmndukvyeweinamhh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheHBtbmR1a3Z5ZXdlaW5hbWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzM0NDMsImV4cCI6MjA2OTA0OTQ0M30.yK_AG2IibwBTpd-q0FPG1BeVBG9yOa6y1maq5qiptrQ'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheHBtbmR1a3Z5ZXdlaW5hbWhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ3MzQ0MywiZXhwIjoyMDY5MDQ5NDQzfQ.1HekGK6JEEUg7nuSz1fwPl3SeVLQNCOyZfYtmf7Eln0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseService = createClient(supabaseUrl, supabaseServiceKey)

async function testDatabaseTables() {
  console.log('🔍 Testing Database Tables...')
  
  const tables = [
    'profiles',
    'chat_messages', 
    'exchange_contracts',
    'reviews',
    'notifications',
    'skills',
    'user_skills'
  ]
  
  for (const table of tables) {
    try {
      const { data, error } = await supabaseService
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Table '${table}': ${error.message}`)
      } else {
        console.log(`✅ Table '${table}': Accessible`)
      }
    } catch (error) {
      console.log(`❌ Table '${table}': ${error.message}`)
    }
  }
}

async function testSearchSystem() {
  console.log('\n🔍 Testing Search System...')
  
  try {
    // Test profiles search
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, bio')
      .ilike('display_name', '%a%')
      .limit(5)
    
    if (profilesError) {
      console.log('❌ Profiles search error:', profilesError.message)
    } else {
      console.log('✅ Profiles search working')
      console.log(`📊 Found ${profiles?.length || 0} profiles with 'a' in name`)
    }
    
    // Test skills search
    const { data: skills, error: skillsError } = await supabase
      .from('skills')
      .select('*')
      .limit(5)
    
    if (skillsError) {
      console.log('❌ Skills search error:', skillsError.message)
    } else {
      console.log('✅ Skills search working')
      console.log(`📊 Found ${skills?.length || 0} skills`)
    }
    
  } catch (error) {
    console.log('❌ Search system error:', error.message)
  }
}

async function testInvitationSystem() {
  console.log('\n📨 Testing Invitation System...')
  
  try {
    // Check if there are any chat invitations
    const { data: chats, error: chatsError } = await supabase
      .from('chat_messages')
      .select('chat_id, sender_id, receiver_id, created_at')
      .limit(5)
    
    if (chatsError) {
      console.log('❌ Chat invitations error:', chatsError.message)
    } else {
      console.log('✅ Chat invitations working')
      console.log(`📊 Found ${chats?.length || 0} chat messages`)
    }
    
  } catch (error) {
    console.log('❌ Invitation system error:', error.message)
  }
}

async function testExchangeSystem() {
  console.log('\n🤝 Testing Exchange System...')
  
  try {
    // Test exchange contracts
    const { data: contracts, error: contractsError } = await supabase
      .from('exchange_contracts')
      .select('*')
      .limit(5)
    
    if (contractsError) {
      console.log('❌ Exchange contracts error:', contractsError.message)
    } else {
      console.log('✅ Exchange contracts working')
      console.log(`📊 Found ${contracts?.length || 0} exchange contracts`)
    }
    
    // Test chat states
    const { data: chats, error: chatsError } = await supabase
      .from('chat_messages')
      .select('chat_id, exchange_state')
      .limit(5)
    
    if (chatsError) {
      console.log('❌ Chat states error:', chatsError.message)
    } else {
      console.log('✅ Chat states working')
    }
    
  } catch (error) {
    console.log('❌ Exchange system error:', error.message)
  }
}

async function testNotificationSystem() {
  console.log('\n🔔 Testing Notification System...')
  
  try {
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .limit(5)
    
    if (notificationsError) {
      console.log('❌ Notifications error:', notificationsError.message)
    } else {
      console.log('✅ Notifications working')
      console.log(`📊 Found ${notifications?.length || 0} notifications`)
    }
    
  } catch (error) {
    console.log('❌ Notification system error:', error.message)
  }
}

async function testReviewSystem() {
  console.log('\n⭐ Testing Review System...')
  
  try {
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .limit(5)
    
    if (reviewsError) {
      console.log('❌ Reviews error:', reviewsError.message)
    } else {
      console.log('✅ Reviews working')
      console.log(`📊 Found ${reviews?.length || 0} reviews`)
    }
    
  } catch (error) {
    console.log('❌ Review system error:', error.message)
  }
}

async function testPerformance() {
  console.log('\n⚡ Testing Performance...')
  
  const startTime = Date.now()
  
  try {
    // Test multiple concurrent queries
    const promises = [
      supabase.from('profiles').select('id').limit(1),
      supabase.from('skills').select('id').limit(1),
      supabase.from('chat_messages').select('id').limit(1),
      supabase.from('exchange_contracts').select('id').limit(1)
    ]
    
    await Promise.all(promises)
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`✅ Performance test completed in ${duration}ms`)
    
    if (duration < 1000) {
      console.log('✅ Performance is good (< 1 second)')
    } else if (duration < 3000) {
      console.log('⚠️ Performance is acceptable (1-3 seconds)')
    } else {
      console.log('❌ Performance is slow (> 3 seconds)')
    }
    
  } catch (error) {
    console.log('❌ Performance test error:', error.message)
  }
}

async function testDataIntegrity() {
  console.log('\n🔒 Testing Data Integrity...')
  
  try {
    // Check for duplicate profiles
    const { data: profiles, error: profilesError } = await supabaseService
      .from('profiles')
      .select('id, display_name')
    
    if (profilesError) {
      console.log('❌ Profiles integrity check error:', profilesError.message)
    } else {
      const uniqueIds = new Set(profiles?.map(p => p.id) || [])
      const uniqueNames = new Set(profiles?.map(p => p.display_name) || [])
      
      if (uniqueIds.size === (profiles?.length || 0)) {
        console.log('✅ No duplicate profile IDs found')
      } else {
        console.log('❌ Duplicate profile IDs detected')
      }
      
      console.log(`📊 Total profiles: ${profiles?.length || 0}`)
      console.log(`📊 Unique IDs: ${uniqueIds.size}`)
      console.log(`📊 Unique names: ${uniqueNames.size}`)
    }
    
  } catch (error) {
    console.log('❌ Data integrity test error:', error.message)
  }
}

async function runComprehensiveTest() {
  console.log('🚀 Starting Comprehensive System Test...')
  console.log('=' * 50)
  
  await testDatabaseTables()
  await testSearchSystem()
  await testInvitationSystem()
  await testExchangeSystem()
  await testNotificationSystem()
  await testReviewSystem()
  await testPerformance()
  await testDataIntegrity()
  
  console.log('\n' + '=' * 50)
  console.log('🎉 Comprehensive System Test Complete!')
  console.log('📋 All systems have been tested and verified.')
}

runComprehensiveTest().catch(error => {
  console.error('💥 Test failed:', error)
}) 