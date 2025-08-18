# System Monitoring API Documentation

## Overview
This document provides comprehensive API documentation for the System Monitoring endpoints in the Portfolio Hub application. These endpoints provide real-time system health, metrics, and information for monitoring and administration purposes.

## Base URL
```
http://localhost:3000/api/system
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## API Endpoints

### 1. System Health Check
**Endpoint:** `GET /health`  
**Description:** Get overall system health status and key metrics  
**Access:** Private (Authenticated users)

**Request:**
```http
GET /api/system/health
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "health": 85,
  "status": "good",
  "details": {
    "cpu": 45,
    "memory": 67,
    "disk": 23,
    "uptime": 48,
    "responseTime": 125,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**Health Status Levels:**
- `excellent` (90-100): System performing optimally
- `good` (75-89): System performing well
- `fair` (50-74): System performance acceptable
- `poor` (25-49): System performance degraded
- `critical` (0-24): System performance critical

**Error Response:**
```json
{
  "success": false,
  "message": "Failed to get system health"
}
```

---

### 2. System Information
**Endpoint:** `GET /info`  
**Description:** Get detailed system information and configuration  
**Access:** Private (Authenticated users)

**Request:**
```http
GET /api/system/info
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "platform": "linux",
    "arch": "x64",
    "hostname": "portfolio-hub-server",
    "type": "Linux",
    "release": "6.14.0-27-generic",
    "cpus": 8,
    "totalMemory": "16.00 GB",
    "freeMemory": "8.50 GB",
    "networkInterfaces": {
      "eth0": [
        {
          "address": "192.168.1.100",
          "netmask": "255.255.255.0",
          "family": "IPv4",
          "mac": "00:11:22:33:44:55",
          "internal": false
        }
      ]
    },
    "userInfo": {
      "username": "nodejs",
      "uid": 1000,
      "gid": 1000,
      "shell": "/bin/bash",
      "homedir": "/home/nodejs"
    },
    "version": "v20.19.4",
    "pid": 12345,
    "uptime": "2d 5h 30m",
    "loadAverage": [1.25, 1.15, 1.05]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Failed to get system information"
}
```

---

### 3. System Metrics
**Endpoint:** `GET /metrics`  
**Description:** Get detailed system metrics for monitoring and analytics  
**Access:** Private (Authenticated users)

**Request:**
```http
GET /api/system/metrics
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "cpu": {
      "usage": 45,
      "loadAverage": [1.25, 1.15, 1.05],
      "cores": 8
    },
    "memory": {
      "total": "16.00 GB",
      "free": "8.50 GB",
      "used": "7.50 GB",
      "usage": 67
    },
    "disk": {
      "usage": 23
    },
    "uptime": {
      "seconds": 176400,
      "formatted": "2d 5h 30m"
    },
    "process": {
      "pid": 12345,
      "memory": {
        "rss": 52428800,
        "heapTotal": 20971520,
        "heapUsed": 10485760,
        "external": 2097152,
        "arrayBuffers": 1048576
      },
      "cpu": {
        "user": 1500000,
        "system": 500000
      }
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Failed to get system metrics"
}
```

---

## Health Score Calculation

The system health score (0-100) is calculated based on multiple factors:

### CPU Usage Impact
- **> 80%**: -20 points
- **> 60%**: -10 points
- **< 60%**: No deduction

### Memory Usage Impact
- **> 90%**: -25 points
- **> 75%**: -15 points
- **< 75%**: No deduction

### Disk Usage Impact
- **> 90%**: -20 points
- **> 80%**: -10 points
- **< 80%**: No deduction

### Response Time Impact
- **> 1000ms**: -15 points
- **> 500ms**: -8 points
- **< 500ms**: No deduction

### Uptime Bonus
- **> 24 hours**: +5 points

---

## Usage Examples

### JavaScript/Fetch Examples

#### Get System Health
```javascript
async function getSystemHealth() {
  const response = await fetch('/api/system/health', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data;
}
```

#### Get System Information
```javascript
async function getSystemInfo() {
  const response = await fetch('/api/system/info', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data.data;
}
```

#### Get System Metrics
```javascript
async function getSystemMetrics() {
  const response = await fetch('/api/system/metrics', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data.data;
}
```

### cURL Examples

#### Get System Health
```bash
curl -X GET \
  http://localhost:3000/api/system/health \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Get System Information
```bash
curl -X GET \
  http://localhost:3000/api/system/info \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Get System Metrics
```bash
curl -X GET \
  http://localhost:3000/api/system/metrics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Monitoring Dashboard Integration

### Real-time Health Monitoring
```javascript
class SystemMonitor {
  constructor() {
    this.healthInterval = null;
    this.metricsInterval = null;
  }

  startHealthMonitoring(callback, intervalMs = 30000) {
    this.healthInterval = setInterval(async () => {
      try {
        const health = await getSystemHealth();
        callback(health);
      } catch (error) {
        console.error('Health monitoring error:', error);
      }
    }, intervalMs);
  }

  startMetricsMonitoring(callback, intervalMs = 60000) {
    this.metricsInterval = setInterval(async () => {
      try {
        const metrics = await getSystemMetrics();
        callback(metrics);
      } catch (error) {
        console.error('Metrics monitoring error:', error);
      }
    }, intervalMs);
  }

  stopMonitoring() {
    if (this.healthInterval) {
      clearInterval(this.healthInterval);
      this.healthInterval = null;
    }
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }
}

// Usage
const monitor = new SystemMonitor();
monitor.startHealthMonitoring((health) => {
  updateHealthDashboard(health);
});
monitor.startMetricsMonitoring((metrics) => {
  updateMetricsDashboard(metrics);
});
```

### Health Status Visualization
```javascript
function updateHealthDashboard(health) {
  const healthScore = health.health;
  const status = health.status;
  
  // Update health score display
  document.getElementById('healthScore').textContent = healthScore;
  
  // Update status indicator
  const statusEl = document.getElementById('healthStatus');
  statusEl.className = `status-${status}`;
  statusEl.textContent = status.toUpperCase();
  
  // Update metrics
  document.getElementById('cpuUsage').textContent = `${health.details.cpu}%`;
  document.getElementById('memoryUsage').textContent = `${health.details.memory}%`;
  document.getElementById('diskUsage').textContent = `${health.details.disk}%`;
  document.getElementById('uptime').textContent = `${health.details.uptime}h`;
}
```

---

## Error Codes

| HTTP Status | Error Message | Description |
|-------------|---------------|-------------|
| 400 | "Invalid request" | Malformed request |
| 401 | "Unauthorized" | Missing or invalid JWT token |
| 403 | "Forbidden" | Insufficient permissions |
| 500 | "Internal server error" | System error or disk access failure |

---

## Performance Considerations

### Caching
- Health checks can be cached for 30 seconds
- System info can be cached for 5 minutes
- Metrics should be real-time (no caching)

### Rate Limiting
- Health endpoint: 10 requests per minute
- Info endpoint: 5 requests per minute
- Metrics endpoint: 20 requests per minute

### Resource Usage
- Disk usage check requires shell command execution
- CPU and memory checks are lightweight
- Network interface enumeration may be slow on some systems

---

## Security Considerations

1. **Authentication Required**: All endpoints require valid JWT tokens
2. **Sensitive Information**: System info may contain sensitive data (IP addresses, user info)
3. **Command Execution**: Disk usage check executes shell commands
4. **Access Control**: Consider restricting access to admin users only
5. **Data Sanitization**: Ensure sensitive data is filtered in production

---

## Troubleshooting

### Common Issues

1. **Disk Usage Not Available**: Ensure `df` command is available on the system
2. **High Response Times**: Check system load and database performance
3. **Memory Leaks**: Monitor process memory usage over time
4. **Permission Errors**: Ensure proper file system permissions

### Debug Logs
The system logs important events:
- Health check failures
- Disk access errors
- High resource usage warnings
- API errors

Check server logs for debugging information.

---

## Future Enhancements

1. **Database Metrics**: Include database connection and query performance
2. **Network Monitoring**: Track network latency and bandwidth usage
3. **Application Metrics**: Monitor application-specific metrics
4. **Alerting System**: Send notifications for critical health issues
5. **Historical Data**: Store and analyze historical metrics
6. **Custom Thresholds**: Allow configuration of health thresholds
