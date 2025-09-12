import React, { useState } from 'react'
import { Play, Square, Download, Upload, Code, Settings, Clock, CheckCircle, AlertCircle } from 'lucide-react'

const PythonAutomation = () => {
  const [activeScript, setActiveScript] = useState(null)
  const [scriptOutput, setScriptOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)

  const automationScripts = [
    {
      id: 1,
      name: 'Inventory Sync',
      description: 'Automatically sync inventory levels across multiple platforms',
      category: 'Inventory',
      lastRun: '2024-01-17 10:30 AM',
      status: 'success',
      schedule: 'Every 2 hours',
      code: `# Inventory Sync Script
import requests
import json

def sync_inventory():
    # Fetch current inventory
    inventory = get_current_inventory()
    
    # Update external platforms
    for platform in ['amazon', 'flipkart', 'myntra']:
        update_platform_inventory(platform, inventory)
    
    print("Inventory sync completed successfully")

if __name__ == "__main__":
    sync_inventory()`
    },
    {
      id: 2,
      name: 'Price Optimization',
      description: 'Analyze competitor prices and optimize product pricing',
      category: 'Pricing',
      lastRun: '2024-01-17 08:00 AM',
      status: 'success',
      schedule: 'Daily at 8 AM',
      code: `# Price Optimization Script
import pandas as pd
import numpy as np

def optimize_prices():
    # Fetch competitor prices
    competitor_data = fetch_competitor_prices()
    
    # Analyze market trends
    market_analysis = analyze_market_trends()
    
    # Calculate optimal prices
    optimal_prices = calculate_optimal_pricing(
        competitor_data, 
        market_analysis
    )
    
    # Update product prices
    update_product_prices(optimal_prices)
    
    print(f"Updated prices for {len(optimal_prices)} products")

if __name__ == "__main__":
    optimize_prices()`
    },
    {
      id: 3,
      name: 'Order Processing',
      description: 'Automatically process and fulfill new orders',
      category: 'Orders',
      lastRun: '2024-01-17 11:45 AM',
      status: 'running',
      schedule: 'Every 15 minutes',
      code: `# Order Processing Script
import time
from datetime import datetime

def process_orders():
    # Fetch new orders
    new_orders = get_new_orders()
    
    for order in new_orders:
        try:
            # Validate order
            if validate_order(order):
                # Process payment
                process_payment(order)
                
                # Update inventory
                update_inventory(order.items)
                
                # Generate shipping label
                generate_shipping_label(order)
                
                # Send confirmation email
                send_confirmation_email(order)
                
                print(f"Processed order {order.id}")
        except Exception as e:
            print(f"Error processing order {order.id}: {e}")

if __name__ == "__main__":
    process_orders()`
    },
    {
      id: 4,
      name: 'Report Generator',
      description: 'Generate daily sales and performance reports',
      category: 'Analytics',
      lastRun: '2024-01-16 11:59 PM',
      status: 'success',
      schedule: 'Daily at 11:59 PM',
      code: `# Report Generator Script
import matplotlib.pyplot as plt
import pandas as pd
from datetime import datetime, timedelta

def generate_daily_report():
    # Fetch sales data
    today = datetime.now().date()
    sales_data = get_sales_data(today)
    
    # Generate charts
    create_sales_chart(sales_data)
    create_product_performance_chart(sales_data)
    
    # Generate PDF report
    report_path = generate_pdf_report(sales_data)
    
    # Send report via email
    send_report_email(report_path)
    
    print(f"Daily report generated: {report_path}")

if __name__ == "__main__":
    generate_daily_report()`
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-400'
      case 'running': return 'text-blue-400'
      case 'error': return 'text-red-400'
      case 'pending': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />
      case 'running': return <Clock className="w-4 h-4 animate-spin" />
      case 'error': return <AlertCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const runScript = (script) => {
    setActiveScript(script)
    setIsRunning(true)
    setScriptOutput('Starting script execution...\n')
    
    // Simulate script execution
    setTimeout(() => {
      setScriptOutput(prev => prev + 'Initializing modules...\n')
    }, 1000)
    
    setTimeout(() => {
      setScriptOutput(prev => prev + 'Processing data...\n')
    }, 2000)
    
    setTimeout(() => {
      setScriptOutput(prev => prev + 'Executing main logic...\n')
    }, 3000)
    
    setTimeout(() => {
      setScriptOutput(prev => prev + 'Script completed successfully!\n')
      setIsRunning(false)
    }, 4000)
  }

  const stopScript = () => {
    setIsRunning(false)
    setScriptOutput(prev => prev + '\nScript execution stopped by user.\n')
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Python Automation</h1>
        <p className="text-gray-300">Automate your business processes with custom Python scripts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400">Total Scripts</h3>
          <p className="text-2xl font-bold text-white">{automationScripts.length}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400">Running</h3>
          <p className="text-2xl font-bold text-blue-400">
            {automationScripts.filter(s => s.status === 'running').length}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400">Successful</h3>
          <p className="text-2xl font-bold text-green-400">
            {automationScripts.filter(s => s.status === 'success').length}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400">Errors</h3>
          <p className="text-2xl font-bold text-red-400">
            {automationScripts.filter(s => s.status === 'error').length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scripts List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Automation Scripts</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                Upload Script
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-700">
            {automationScripts.map((script) => (
              <div key={script.id} className="p-6 hover:bg-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{script.name}</h3>
                    <p className="text-sm text-gray-300 mt-1">{script.description}</p>
                  </div>
                  <div className={`flex items-center space-x-1 ${getStatusColor(script.status)}`}>
                    {getStatusIcon(script.status)}
                    <span className="text-sm capitalize">{script.status}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <span>Category: {script.category}</span>
                  <span>Last run: {script.lastRun}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-400">
                    <Clock className="w-4 h-4 mr-1" />
                    {script.schedule}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setActiveScript(script)}
                      className="text-blue-400 hover:text-blue-300 flex items-center"
                    >
                      <Code className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button 
                      onClick={() => runScript(script)}
                      disabled={isRunning}
                      className="text-green-400 hover:text-green-300 flex items-center disabled:opacity-50"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Run
                    </button>
                    <button className="text-gray-400 hover:text-gray-300">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Script Editor/Output */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                {activeScript ? activeScript.name : 'Script Output'}
              </h2>
              <div className="flex space-x-2">
                {isRunning ? (
                  <button 
                    onClick={stopScript}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </button>
                ) : (
                  <button 
                    onClick={() => activeScript && runScript(activeScript)}
                    disabled={!activeScript}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run
                  </button>
                )}
                <button className="border border-gray-600 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {activeScript ? (
              <div className="space-y-4">
                {/* Script Code */}
                <div>
                  <h3 className="font-medium mb-2 text-white">Script Code:</h3>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{activeScript.code}</code>
                  </pre>
                </div>
                
                {/* Output */}
                {scriptOutput && (
                  <div>
                    <h3 className="font-medium mb-2 text-white">Output:</h3>
                    <pre className="bg-gray-700 p-4 rounded-lg text-sm overflow-x-auto border border-gray-600 text-gray-200">
                      {scriptOutput}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Code className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Select a script to view its code and output</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4 text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-600 rounded-lg hover:bg-gray-700 text-left">
            <div className="flex items-center mb-2">
              <Upload className="w-5 h-5 text-blue-400 mr-2" />
              <span className="font-medium text-white">Upload New Script</span>
            </div>
            <p className="text-sm text-gray-300">Add a custom Python automation script</p>
          </button>
          
          <button className="p-4 border border-gray-600 rounded-lg hover:bg-gray-700 text-left">
            <div className="flex items-center mb-2">
              <Settings className="w-5 h-5 text-green-400 mr-2" />
              <span className="font-medium text-white">Schedule Manager</span>
            </div>
            <p className="text-sm text-gray-300">Manage script schedules and triggers</p>
          </button>
          
          <button className="p-4 border border-gray-600 rounded-lg hover:bg-gray-700 text-left">
            <div className="flex items-center mb-2">
              <Download className="w-5 h-5 text-purple-400 mr-2" />
              <span className="font-medium text-white">Export Logs</span>
            </div>
            <p className="text-sm text-gray-300">Download execution logs and reports</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default PythonAutomation