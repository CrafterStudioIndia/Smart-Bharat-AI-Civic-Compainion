import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, queryType, citizenData, userApiKey } = await req.json();
    
    // Retrieve API key: first check request body, then header, then env variables
    const apiKey = userApiKey || req.headers.get("x-gemini-api-key") || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Mock response for showcase/hackathon environment if API key is not set
      return NextResponse.json({
        content: getMockResponse(queryType || "general", messages?.[messages.length - 1]?.content || ""),
        isMock: true
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Construct prompt based on request type
    let systemInstruction = `You are "Smart Bharat AI", a high-performance GenAI-powered civic companion for Indian citizens.
Your job is to:
1. Simplify complex Indian government rules, schemes (like PM-Kisan, Ayushman Bharat, PM-Awas Yojana, etc.).
2. Translate complex policy terms into plain English and Hindi (and support regional Indian languages).
3. Answer queries clearly, point-by-point, listing exact eligibility criteria, documents needed, and application steps.
4. Assist with complaint drafting or reporting public issues (e.g., potholes, street lights, sanitation). Make sure to format outputs beautifully with markdown.
`;

    const lastMessage = messages?.[messages.length - 1]?.content || "";
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // We use 2.5-flash or 2.0-flash as it is standard and high performance
      contents: lastMessage,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return NextResponse.json({
      content: response.text,
      isMock: false
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({
      content: "Smart Bharat AI experienced a connection issue, but here is your civic response placeholder: " + error.message,
      isMock: true,
      error: error.message
    }, { status: 500 });
  }
}

function getMockResponse(type: string, query: string): string {
  const q = query.toLowerCase();
  
  if (type === "eligibility" || q.includes("eligibility") || q.includes("pension") || q.includes("pm-kisan") || q.includes("kisan") || q.includes("ayushman")) {
    return `### **Smart Bharat Eligibility Engine** 🇮🇳
Based on your inquiry about **PM-Kisan Samman Nidhi & Ayushman Bharat Eligibility**:

#### **1. PM-Kisan Samman Nidhi**
* **Status**: **Eligible** (assuming small/marginal landholding).
* **Benefits**: ₹6,000 per year in three equal installments of ₹2,000.
* **Requirements**:
  * Landholding details (Khatauni/Khasra).
  * Aadhaar Card (mandatory & linked with bank account).
  * Active Bank Account (DBT enabled).

#### **2. Ayushman Bharat (PM-JAY)**
* **Status**: **Conditional Eligibility** (verified via SECC 2011 database).
* **Benefits**: Cashless health cover of up to **₹5 Lakh** per family per year for secondary & tertiary care.
* **Verification Documents Needed**:
  * Aadhaar Card or Ration Card.
  * Mobile Number linked with Aadhaar.

Would you like me to draft your application or find the nearest Common Service Centre (CSC)?`;
  }
  
  if (type === "complaint" || q.includes("pothole") || q.includes("road") || q.includes("issue") || q.includes("complaint") || q.includes("garbage") || q.includes("water")) {
    return `### **Smart Bharat Civic Grievance Draft** ⚠️
I have processed your report and structured a formal complaint ready for submission to the **Municipal Corporation (MCD/BMC)**:

**Subject**: Urgent repair of critical road damage and potholes in Sector-4, Dwarka.

#### **Grievance Summary**:
* **Issue Type**: Severe Road Potholes / Safety Hazard
* **Location Coordinates**: 28.5921° N, 77.0463° E (Sector-4 Metro Station Road)
* **Severity**: High (Causing daily traffic delays and minor accidents)

#### **Draft Official Complaint**:
> To,  
> The Commissioner,  
> Municipal Corporation.  
>  
> Sir/Madam,  
> I am writing to report a major road hazard near Sector-4 Metro Station. There are multiple deep potholes that pose a severe threat to two-wheelers and pedestrians, especially during night hours.  
> We request immediate patching of this section.  
>  
> Respectfully submitted,  
> Resident of Ward 12.

#### **Next Action Plan**:
1. File uploaded to **CPGRAMS Portal** under Civic Utilities.
2. Tracking reference generated: **#SB-2026-99824**.
3. Status tracking set to **Active (Awaiting Review)**.`;
  }
  
  return `### **Smart Bharat Civic Assistant** 🤖
Hello! I can help you navigate Indian government services, check scheme eligibilities, draft civic complaints, and prepare documents.

**Quick Options you can ask me about:**
1. *"Am I eligible for PM-Kisan and what documents are required?"*
2. *"Draft a complaint to the municipal corporation for garbage pile-up in my area."*
3. *"List the documents required for obtaining a duplicate Ration Card."*

Feel free to paste any text or query above!`;
}
