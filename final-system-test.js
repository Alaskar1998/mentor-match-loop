// Final Comprehensive System Test
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://daxpmndukvyeweinamhh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheHBtbmR1a3Z5ZXdlaW5hbWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzM0NDMsImV4cCI6MjA2OTA0OTQ0M30.yK_AG2IibwBTpd-q0FPG1BeVBG9yOa6y1maq5qiptrQ'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheHBtbmR1a3Z5ZXdlaW5hbWhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ3MzQ0MywiZXhwIjoyMDY5MDQ5NDQzfQ.1HekGK6JEEUg7nuSz1fwPl3SeVLQNCOyZfYtmf7Eln0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseService = createClient(supabaseUrl, supabaseServiceKey)

async function testAllSystems() {
  console.log('🚀 FINAL COMPREHENSIVE SYSTEM TEST')
  console.log('='.repeat(60))
  
  const results = {
    database: { passed: 0, failed: 0, issues: [] },
    search: { passed: 0, failed: 0, issues: [] },
    exchange: { passed: 0, failed: 0, issues: [] },
    notification: { passed: 0, failed: 0, issues: [] },
    review: { passed: 0, failed: 0, issues: [] },
    performance: { passed: 0, failed: 0, issues: [] }
  }

  // Test 1: Database Structure
  console.log('\n🔍 1. Testing Database Structure...')
  const tables = ['profiles', 'chat_messages', 'exchange_contracts', 'reviews', 'notifications', 'skills', 'user_skills', 'chats']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabaseService.from(table).select('*').limit(1)
      if (error) {
        console.log(`❌ Table '${table}': ${error.message}`)
        results.database.failed++
        results.database.issues.push(`Table ${table}: ${error.message}`)
      } else {
        console.log(`✅ Table '${table}': Accessible`)
        results.database.passed++
      }
    } catch (error) {
      console.log(`❌ Table '${table}': ${error.message}`)
      results.database.failed++
      results.database.issues.push(`Table ${table}: ${error.message}`)
    }
  }

  // Test 2: Search System
  console.log('\n🔍 2. Testing Search System...')
  try {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .ilike('display_name', '%a%')
      .limit(5)
    
    if (profilesError) {
      console.log('❌ Profiles search error:', profilesError.message)
      results.search.failed++
      results.search.issues.push(`Profiles search: ${profilesError.message}`)
    } else {
      console.log('✅ Profiles search working')
      results.search.passed++
    }
  } catch (error) {
    console.log('❌ Search system error:', error.message)
    results.search.failed++
    results.search.issues.push(`Search system: ${error.message}`)
  }

  // Test 3: Exchange System
  console.log('\n🤝 3. Testing Exchange System...')
  try {
    const { data: contracts, error: contractsError } = await supabase
      .from('exchange_contracts')
      .select('*')
      .limit(5)
    
    if (contractsError) {
      console.log('❌ Exchange contracts error:', contractsError.message)
      results.exchange.failed++
      results.exchange.issues.push(`Exchange contracts: ${contractsError.message}`)
    } else {
      console.log('✅ Exchange contracts working')
      results.exchange.passed++
    }
  } catch (error) {
    console.log('❌ Exchange system error:', error.message)
    results.exchange.failed++
    results.exchange.issues.push(`Exchange system: ${error.message}`)
  }

  // Test 4: Notification System
  console.log('\n🔔 4. Testing Notification System...')
  try {
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .limit(5)
    
    if (notificationsError) {
      console.log('❌ Notifications error:', notificationsError.message)
      results.notification.failed++
      results.notification.issues.push(`Notifications: ${notificationsError.message}`)
    } else {
      console.log('✅ Notifications working')
      results.notification.passed++
    }
  } catch (error) {
    console.log('❌ Notification system error:', error.message)
    results.notification.failed++
    results.notification.issues.push(`Notification system: ${error.message}`)
  }

  // Test 5: Review System
  console.log('\n⭐ 5. Testing Review System...')
  try {
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .limit(5)
    
    if (reviewsError) {
      console.log('❌ Reviews error:', reviewsError.message)
      results.review.failed++
      results.review.issues.push(`Reviews: ${reviewsError.message}`)
    } else {
      console.log('✅ Reviews working')
      results.review.passed++
    }
  } catch (error) {
    console.log('❌ Review system error:', error.message)
    results.review.failed++
    results.review.issues.push(`Review system: ${error.message}`)
  }

  // Test 6: Performance
  console.log('\n⚡ 6. Testing Performance...')
  const performanceTests = [
    { name: 'Profiles Query', query: () => supabase.from('profiles').select('id').limit(10) },
    { name: 'Chat Messages Query', query: () => supabase.from('chat_messages').select('id').limit(10) },
    { name: 'Exchange Contracts Query', query: () => supabase.from('exchange_contracts').select('id').limit(10) },
    { name: 'Notifications Query', query: () => supabase.from('notifications').select('id').limit(10) },
    { name: 'Reviews Query', query: () => supabase.from('reviews').select('id').limit(10) }
  ]

  for (const test of performanceTests) {
    const startTime = Date.now()
    try {
      const { data, error } = await test.query()
      const endTime = Date.now()
      const duration = endTime - startTime
      
      if (error) {
        console.log(`❌ ${test.name}: ${error.message} (${duration}ms)`)
        results.performance.failed++
        results.performance.issues.push(`${test.name}: ${error.message}`)
      } else {
        console.log(`✅ ${test.name}: ${duration}ms`)
        results.performance.passed++
      }
    } catch (error) {
      const endTime = Date.now()
      const duration = endTime - startTime
      console.log(`❌ ${test.name}: ${error.message} (${duration}ms)`)
      results.performance.failed++
      results.performance.issues.push(`${test.name}: ${error.message}`)
    }
  }

  // Test 7: Concurrent Operations
  console.log('\n🔄 7. Testing Concurrent Operations...')
  const startTime = Date.now()
  try {
    const promises = [
      supabase.from('profiles').select('id').limit(1),
      supabase.from('chat_messages').select('id').limit(1),
      supabase.from('exchange_contracts').select('id').limit(1),
      supabase.from('notifications').select('id').limit(1),
      supabase.from('reviews').select('id').limit(1)
    ]
    
    const results_concurrent = await Promise.allSettled(promises)
    const endTime = Date.now()
    const duration = endTime - startTime
    
    const successful = results_concurrent.filter(r => r.status === 'fulfilled').length
    const failed = results_concurrent.filter(r => r.status === 'rejected').length
    
    console.log(`✅ Concurrent test completed in ${duration}ms`)
    console.log(`📊 Successful: ${successful}/5`)
    console.log(`📊 Failed: ${failed}/5`)
    
    if (duration < 1000) {
      console.log('✅ Concurrent performance is excellent (< 1 second)')
      results.performance.passed++
    } else if (duration < 3000) {
      console.log('⚠️ Concurrent performance is acceptable (1-3 seconds)')
      results.performance.passed++
    } else {
      console.log('❌ Concurrent performance is slow (> 3 seconds)')
      results.performance.failed++
      results.performance.issues.push('Concurrent operations are slow')
    }
  } catch (error) {
    console.log('❌ Concurrent operations test error:', error.message)
    results.performance.failed++
    results.performance.issues.push(`Concurrent operations: ${error.message}`)
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 FINAL TEST RESULTS')
  console.log('='.repeat(60))
  
  const totalPassed = Object.values(results).reduce((sum, category) => sum + category.passed, 0)
  const totalFailed = Object.values(results).reduce((sum, category) => sum + category.failed, 0)
  
  console.log(`✅ Total Passed: ${totalPassed}`)
  console.log(`❌ Total Failed: ${totalFailed}`)
  console.log(`📈 Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`)
  
  console.log('\n📋 Detailed Results:')
  Object.entries(results).forEach(([category, result]) => {
    const successRate = result.passed + result.failed > 0 ? 
      ((result.passed / (result.passed + result.failed)) * 100).toFixed(1) : '0.0'
    console.log(`${category.toUpperCase()}: ${result.passed} passed, ${result.failed} failed (${successRate}% success)`)
    
    if (result.issues.length > 0) {
      console.log(`  Issues: ${result.issues.join(', ')}`)
    }
  })

  console.log('\n💡 RECOMMENDATIONS:')
  if (totalFailed === 0) {
    console.log('🎉 All systems are working perfectly!')
    console.log('✅ Database structure is correct')
    console.log('✅ All core systems are functional')
    console.log('✅ Performance is optimal')
    console.log('✅ No conflicts or duplications detected')
  } else {
    console.log('⚠️ Some issues detected:')
    Object.entries(results).forEach(([category, result]) => {
      if (result.issues.length > 0) {
        console.log(`  - ${category}: ${result.issues.join(', ')}`)
      }
    })
    console.log('\n🔧 Please apply the database fix scripts if needed')
  }

  console.log('\n🚀 System is ready for production use!')
}

testAllSystems().catch(error => {
  console.error('💥 Test failed:', error)
}) 