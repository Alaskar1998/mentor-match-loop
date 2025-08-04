// Test script to add a user with "Advertising" skill
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://daxpmndukvyeweinamhh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRheHBtbmR1a3Z5ZXdlaW5hbWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5NzI4NzQsImV4cCI6MjA0NzU0ODg3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function addTestUser() {
  try {
    // Add a test user with "Advertising" skill
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: 'test-user-advertising',
          display_name: 'Test User Advertising',
          bio: 'I can teach advertising',
          skills_to_teach: ['Advertising', 'Marketing'],
          willing_to_teach_without_return: true,
          country: 'United States',
          gender: 'Male'
        }
      ])
    
    if (error) {
      console.error('Error adding test user:', error)
    } else {
      console.log('Test user added successfully:', data)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

addTestUser() 