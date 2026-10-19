# DriveFull — Website មិនត្រូវការ Login

គម្រោងនេះប្រើ React + ASP.NET Core Web API + Google Drive API។ អ្នកចូល Website ដោយមិនចាំបាច់ Login Google ឬបង្កើតគណនី។

## មុខងារ
- មិនមាន Google Login ឬ session អ្នកប្រើប្រាស់។
- បន្ថែម Google Drive Folder link ហើយមើល Folder/វីដេអូដែលបានចែករំលែកជាសាធារណៈ។
- Folder links ត្រូវបានរក្សាទុកក្នុង localStorage របស់ browser សម្រាប់ starter/demo។
- Folder ឯកជន ឬ Folder ដែលបាន Share ទៅ Gmail ជាក់លាក់មួយ មិនអាចអានដោយគេហទំព័រដែលគ្មាន Login បានទេ។

## តម្រូវការ
- .NET 8 SDK
- Node.js 20+
- Google Cloud project និង Google Drive API key

## Google Drive API setup
1. ចូល https://console.cloud.google.com/ ហើយបង្កើត/ជ្រើស Project។
2. បើក **Google Drive API**។
3. បង្កើត API key នៅ APIs & Services → Credentials។ សម្រាប់ production សូមកំណត់ API restrictions ឱ្យមានតែ Google Drive API និងកំណត់ website/API restrictions ឱ្យត្រឹមត្រូវតាម hosting របស់អ្នក។
4. សម្រាប់ Folder នីមួយៗដែលចង់បង្ហាញ៖ Google Drive → Share → General access → **Anyone with the link** → **Viewer**។ ការបើកសិទ្ធិនេះអាចឱ្យអ្នកណាដែលមាន Link ចូលមើលបាន ដូច្នេះកុំប្រើសម្រាប់ទិន្នន័យឯកជន។

## រត់ Backend
```bash
cd backend
dotnet restore
dotnet user-secrets init
dotnet user-secrets set "Google:ApiKey" "YOUR_GOOGLE_DRIVE_API_KEY"
dotnet run
```

## រត់ Frontend
បើ API មិនរត់នៅ `https://localhost:7001` សូមកែ `VITE_API_BASE` ក្នុង `frontend/.env`។
```bash
cd frontend
npm install
npm run dev
```

## ចំណាំសុវត្ថិភាព
- មិនត្រូវការ Login ប៉ុន្តែមានន័យថា Website អាចបង្ហាញបានតែ Folder ដែលអាចមើលជាសាធារណៈ/Anyone with the link។ វាមិនអាចបើក Folder private បានទេ ហើយ API key មិនមែនជាការអនុញ្ញាតឱ្យចូល Folder private នោះទេ។
- សម្រាប់ production កុំបង្ហាញ API key ដល់ browser។ កំណត់ key នៅ Backend ជា environment variable ឬ secret manager ហើយកំណត់ restrictions។
- Folder list បច្ចុប្បន្នរក្សាទុកក្នុង browser localStorage; មិនមាន database រួមសម្រាប់អ្នកប្រើទាំងអស់។
