import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { supabase } from '../utils/supabaseClient'
import { createSession } from '../utils/sessionManager'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  
  const createOrUpdateUser = async (email, name, userType, profilePicture = null) => {
    try {
      console.log('🔐 Creating user:', { email, name, userType, profilePicture })
      
      const nameParts = name.split(' ')
      const firstName = nameParts[0] || name
      const lastName = nameParts.slice(1).join(' ') || nameParts[0]
      
      // Check if user exists
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      
      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking user:', selectError)
      }
      
      if (!existingUser) {
        console.log('📝 Creating new user...')
        
        // Generate patient key for new patients
        let patientKey = null
        if (userType === 'patient') {
          patientKey = Math.floor(100000000 + Math.random() * 900000000).toString()
          console.log('🔑 Generated patient key:', patientKey)
        }
        
        // Try to create user with profile_picture
        let userData = { 
          email, 
          first_name: firstName, 
          last_name: lastName, 
          user_type: userType,
          patient_key: patientKey,
          profile_picture: profilePicture
        }
        
        let { error } = await supabase
          .from('users')
          .insert([userData])
        
        // If error due to profile_picture column, retry without it
        if (error && error.message?.includes('profile_picture')) {
          console.log('⚠️ profile_picture column not found, creating user without it...')
          const { email: e, first_name, last_name, user_type, patient_key } = userData
          const { error: retryError } = await supabase
            .from('users')
            .insert([{ email: e, first_name, last_name, user_type, patient_key }])
          
          if (retryError) {
            console.error('❌ Error creating user (retry):', retryError)
            alert('Error creating account: ' + retryError.message)
            return false
          }
        } else if (error) {
          console.error('❌ Error creating user:', error)
          alert('Error creating account: ' + error.message)
          return false
        }
        console.log('✅ User created', profilePicture ? 'with profile picture' : '')
      } else {
        console.log('✅ User already exists')
        
        // Update profile picture if provided (backward compatible)
        if (profilePicture) {
          try {
            const { error: updateError } = await supabase
              .from('users')
              .update({ profile_picture: profilePicture })
              .eq('email', email)
            
            if (updateError && !updateError.message?.includes('profile_picture')) {
              console.error('⚠️ Error updating profile picture:', updateError)
            } else if (!updateError) {
              console.log('✅ Profile picture updated')
            }
          } catch (err) {
            console.log('⚠️ Could not update profile picture (column may not exist)')
          }
        }
        
        // Check if existing patient needs a patient_key
        if (userType === 'patient' && !existingUser.patient_key) {
          console.log('🔑 Existing patient missing patient_key, generating one...')
          const patientKey = Math.floor(100000000 + Math.random() * 900000000).toString()
          
          const { error: updateError } = await supabase
            .from('users')
            .update({ patient_key: patientKey })
            .eq('email', email)
          
          if (updateError) {
            console.error('❌ Error updating patient_key:', updateError)
            // Don't fail login, but log the error
          } else {
            console.log('✅ Patient key generated and saved:', patientKey)
          }
        }
      }
      
      // Create session in Supabase
      console.log('🔑 Creating session...')
      const sessionId = await createSession(email, name, userType, profilePicture)
      if (!sessionId) {
        console.error('❌ Session creation failed')
        alert('Error creating session. Please try again.')
        return false
      }
      console.log('✅ Session created:', sessionId)
      
      return true
    } catch (error) {
      console.error('❌ Login error:', error)
      alert('Login failed: ' + error.message)
      return false
    }
  }




  return (
    <div className="login-page">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back to Home
      </button>

      <div className="login-container">
        <h1 className="login-title">Welcome to Amma</h1>
        <p className="login-subtitle">Sign in or create an account to get started</p>

        <div className="login-options">
          <div className="login-section">
            <h2>I'm a Patient</h2>
            <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>Access your personalized health information</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  const decoded = jwtDecode(credentialResponse.credential)
                  console.log('✅ Patient login successful:', {
                    email: decoded.email,
                    name: decoded.name,
                    picture: decoded.picture
                  })
                  const success = await createOrUpdateUser(decoded.email, decoded.name, 'patient', decoded.picture)
                  if (success) {
                    navigate('/patient')
                  }
                }}
                onError={() => {
                  console.error('❌ Google login failed')
                  alert('Login failed. Please try again.')
                }}
              />
            </div>
          </div>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="login-section">
            <h2>I'm a Doctor</h2>
            <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>Manage your practice and patients</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  const decoded = jwtDecode(credentialResponse.credential)
                  console.log('✅ Doctor login successful:', {
                    email: decoded.email,
                    name: decoded.name,
                    picture: decoded.picture
                  })
                  const success = await createOrUpdateUser(decoded.email, decoded.name, 'doctor', decoded.picture)
                  if (success) {
                    navigate('/doctor')
                  }
                }}
                onError={() => {
                  console.error('❌ Google login failed')
                  alert('Login failed. Please try again.')
                }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Login

