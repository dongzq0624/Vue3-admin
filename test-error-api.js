// 测试错误报告 API
async function testErrorAPI() {
  try {
    const response = await fetch('http://localhost:3300/api/error-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        errors: [
          {
            type: 'test',
            message: '测试错误信息',
            timestamp: Date.now(),
            source: 'test.js',
            lineno: 10,
            colno: 5
          }
        ],
        clientVersion: '1.0.0',
        clientType: 'web'
      })
    })

    const result = await response.json()
    console.log('API 响应状态:', response.status)
    console.log('API 响应内容:', result)

    if (response.ok) {
      console.log('✅ 错误报告 API 测试成功！')
    } else {
      console.log('❌ 错误报告 API 测试失败！')
    }
  } catch (error) {
    console.error('测试失败:', error)
  }
}

testErrorAPI()
