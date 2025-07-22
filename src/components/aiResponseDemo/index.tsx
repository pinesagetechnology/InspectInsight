import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AIResponseDisplay from '../aiResponseDisplay';
import { AISource } from '../../models/webllm';

const sampleAIResponse = `# Inspection Summary Report

## **Structure Overview**
The inspection of **Bridge XYZ-123** was conducted on **December 15, 2024** under **clear weather conditions** with a temperature of **18°C**.

## **Key Findings**

### **Condition Ratings**
- **Excellent (5)**: 15 elements
- **Good (4)**: 28 elements  
- **Fair (3)**: 12 elements
- **Poor (2)**: 3 elements
- **Critical (1)**: 1 element

### **Critical Issues Identified**
1. **Crack in main beam** - Requires immediate attention
2. **Corrosion on steel elements** - Monitor closely
3. **Deteriorated expansion joints** - Schedule replacement

## **Maintenance Recommendations**

### **Immediate Actions (Next 30 days)**
- Repair the crack in the main beam using epoxy injection
- Apply protective coating to corroded steel elements
- Install temporary supports for weakened sections

### **Short-term Actions (Next 6 months)**
- Replace deteriorated expansion joints
- Conduct detailed structural analysis
- Implement monitoring system for critical areas

### **Long-term Planning (Next 2 years)**
- Plan for major rehabilitation work
- Consider load capacity upgrades
- Develop comprehensive maintenance schedule

## **Technical Details**

**Structural Elements Inspected:**
\`\`\`
- Main beams: 8 units
- Support columns: 12 units  
- Deck slabs: 24 units
- Expansion joints: 4 units
\`\`\`

**Inspection Method:** Visual inspection with *supplementary testing* where required.

> **Note:** This inspection was conducted following standard procedures and all findings should be reviewed by a qualified structural engineer before implementing any repairs.

**Next Inspection Due:** June 15, 2025`;

const AIResponseDemo: React.FC = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        AI Response Display Demo
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        This demonstrates how AI-generated inspection comments will be displayed with proper formatting, styling, and user-friendly presentation.
      </Typography>
      
      <AIResponseDisplay
        content={sampleAIResponse}
        source="online"
        modelName="Azure AI GPT-4"
        timestamp={new Date()}
      />
      
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          The AI response includes:
        </Typography>
        <Box component="ul" sx={{ textAlign: 'left', maxWidth: 400, mx: 'auto', mt: 1 }}>
          <li>Proper heading hierarchy</li>
          <li>Bold and italic text formatting</li>
          <li>Code blocks for technical details</li>
          <li>Bulleted and numbered lists</li>
          <li>Blockquotes for important notes</li>
          <li>Clean, readable typography</li>
        </Box>
      </Box>
    </Box>
  );
};

export default AIResponseDemo; 