
export interface VocabWord {
  word: string;
  ipa: string;
  meaning: string;
  example: string;
}

export interface VocabBranch {
  branchName: string;
  words: VocabWord[];
}

export interface VocabTopic {
  id: string;
  topicName: string;
  icon: string;
  branches: VocabBranch[];
}

export const vocabTopicsData: VocabTopic[] = [
  {
    id: 'business',
    topicName: 'Business & Finance',
    icon: '💼',
    branches: [
      {
        branchName: 'Marketing',
        words: [
          { word: 'Brand Equity', ipa: '/brænd ˈekwɪti/', meaning: 'Giá trị thương hiệu', example: 'Strong brand equity allows a company to charge premium prices.' },
          { word: 'Market Penetration', ipa: '/ˈmɑːrkɪt ˌpenɪˈtreɪʃn/', meaning: 'Thâm nhập thị trường', example: 'The company is seeking higher market penetration in Asia.' },
          { word: 'Consumer Behavior', ipa: '/kənˈsuːmər bɪˈheɪvjər/', meaning: 'Hành vi người tiêu dùng', example: 'Digital marketing relies heavily on analyzing consumer behavior.' },
          { word: 'Value Proposition', ipa: '/ˈvæljuː ˌprɑːpəˈzɪʃn/', meaning: 'Tuyên bố giá trị', example: 'A clear value proposition is essential for any startup.' },
          { word: 'Segmentation', ipa: '/ˌseɡmenˈteɪʃn/', meaning: 'Phân khúc thị trường', example: 'Market segmentation helps target specific customer groups.' },
          { word: 'Demographics', ipa: '/ˌdeməˈɡræfɪks/', meaning: 'Nhân khẩu học', example: 'The product appeals to a younger demographic.' },
          { word: 'Engagement Rate', ipa: '/ɪnˈɡeɪdʒmənt reɪt/', meaning: 'Tỷ lệ tương tác', example: 'Our social media engagement rate has doubled this month.' }
        ]
      },
      {
        branchName: 'Accounting',
        words: [
          { word: 'Balance Sheet', ipa: '/ˈbæləns ʃiːt/', meaning: 'Bảng cân đối kế toán', example: 'The balance sheet shows the company\'s assets and liabilities.' },
          { word: 'Audit', ipa: '/ˈɔːdɪt/', meaning: 'Kiểm toán', example: 'The annual audit will begin next Monday.' },
          { word: 'Depreciation', ipa: '/dɪˌpriːʃiˈeɪʃn/', meaning: 'Khấu hao', example: 'Depreciation reduces the taxable income of the business.' },
          { word: 'Accounts Payable', ipa: '/əˈkaʊnts ˈpeɪəbl/', meaning: 'Khoản phải trả', example: 'Managing accounts payable is crucial for cash flow.' },
          { word: 'Equity', ipa: '/ˈekwɪti/', meaning: 'Vốn chủ sở hữu', example: 'The owners have a 60% equity stake in the firm.' },
          { word: 'Fiscal Year', ipa: '/ˈfɪskl jɪər/', meaning: 'Năm tài chính', example: 'Our fiscal year ends on December 31st.' },
          { word: 'Revenue', ipa: '/ˈrevənjuː/', meaning: 'Doanh thu', example: 'The company reported record revenue for the third quarter.' }
        ]
      },
      {
        branchName: 'Human Resources',
        words: [
          { word: 'Talent Acquisition', ipa: '/ˈtælənt ˌækwɪˈzɪʃn/', meaning: 'Tuyển dụng nhân tài', example: 'Talent acquisition is more than just traditional recruiting.' },
          { word: 'Retention Rate', ipa: '/rɪˈtenʃn reɪt/', meaning: 'Tỷ lệ giữ chân nhân viên', example: 'A high retention rate indicates good employee satisfaction.' },
          { word: 'Onboarding', ipa: '/ˈɑːnbɔːrdɪŋ/', meaning: 'Hội nhập nhân viên mới', example: 'The onboarding process takes about two weeks.' },
          { word: 'Performance Appraisal', ipa: '/pərˈfɔːrməns əˈpreɪzl/', meaning: 'Đánh giá năng lực', example: 'Annual performance appraisals help in career development.' },
          { word: 'Compensation', ipa: '/ˌkɑːmpenˈseɪʃn/', meaning: 'Thù lao/Lương thưởng', example: 'The compensation package includes health insurance and bonuses.' },
          { word: 'Workforce', ipa: '/ˈwɜːrkfɔːrs/', meaning: 'Lực lượng lao động', example: 'The company is looking to diversify its workforce.' },
          { word: 'Severance Pay', ipa: '/ˈsevərəns peɪ/', meaning: 'Trợ cấp thôi việc', example: 'He received six months of severance pay after the layoff.' }
        ]
      },
      {
        branchName: 'Management',
        words: [
          { word: 'Strategic Planning', ipa: '/strəˈtiːdʒɪk ˈplænɪŋ/', meaning: 'Hoạch định chiến lược', example: 'Strategic planning is a key responsibility of senior management.' },
          { word: 'Delegation', ipa: '/ˌdelɪˈɡeɪʃn/', meaning: 'Sự ủy quyền', example: 'Effective delegation allows managers to focus on high-level tasks.' },
          { word: 'Stakeholder', ipa: '/ˈsteɪkhəʊldər/', meaning: 'Bên liên quan', example: 'The board must consider the interests of all stakeholders.' },
          { word: 'Bureaucracy', ipa: '/bjʊˈrɑːkrəsi/', meaning: 'Sự quan liêu', example: 'Large organizations often struggle with excessive bureaucracy.' },
          { word: 'Micro-management', ipa: '/ˈmaɪkrəʊˌmænɪdʒmənt/', meaning: 'Quản lý vi mô', example: 'Micro-management can stifle creativity and motivation.' },
          { word: 'Leadership Style', ipa: '/ˈliːdərʃɪp staɪl/', meaning: 'Phong cách lãnh đạo', example: 'Her democratic leadership style encourages collaboration.' },
          { word: 'Milestone', ipa: '/ˈmaɪlstəʊn/', meaning: 'Cột mốc quan trọng', example: 'Reaching 1 million users was a major milestone for the startup.' }
        ]
      }
    ]
  },
  {
    id: 'medicine',
    topicName: 'Anatomy & Medicine',
    icon: '🏥',
    branches: [
      {
        branchName: 'Internal Organs',
        words: [
          { word: 'Pancreas', ipa: '/ˈpæŋkriəs/', meaning: 'Tuyến tụy', example: 'The pancreas produces insulin to regulate blood sugar.' },
          { word: 'Diaphragm', ipa: '/ˈdaɪəfræm/', meaning: 'Cơ hoành', example: 'The diaphragm is the primary muscle used in breathing.' },
          { word: 'Ventricle', ipa: '/ˈventrɪkl/', meaning: 'Tâm thất', example: 'The heart has two upper atria and two lower ventricles.' },
          { word: 'Esophagus', ipa: '/ɪˈsɑːfəɡəs/', meaning: 'Thực quản', example: 'Food travels down the esophagus to the stomach.' },
          { word: 'Capillaries', ipa: '/ˈkæpəleriz/', meaning: 'Mao mạch', example: 'Capillaries are the smallest blood vessels in the body.' },
          { word: 'Bladder', ipa: '/ˈblædər/', meaning: 'Bàng quang', example: 'The bladder stores urine before it is excreted.' },
          { word: 'Cerebellum', ipa: '/ˌserəˈbeləm/', meaning: 'Tiểu não', example: 'The cerebellum coordinate voluntary movements.' }
        ]
      },
      {
        branchName: 'Skeleton',
        words: [
          { word: 'Clavicle', ipa: '/ˈklævɪkl/', meaning: 'Xương đòn', example: 'The clavicle is commonly known as the collarbone.' },
          { word: 'Scapula', ipa: '/ˈskæpjələ/', meaning: 'Xương bả vai', example: 'The scapula connects the humerus with the clavicle.' },
          { word: 'Vertebrae', ipa: '/ˈvɜːrtɪbriː/', meaning: 'Đốt sống', example: 'Human spine consists of 33 vertebrae.' },
          { word: 'Femur', ipa: '/ˈfiːmər/', meaning: 'Xương đùi', example: 'The femur is the longest and strongest bone in the body.' },
          { word: 'Cartilage', ipa: '/ˈkɑːrtɪlɪdʒ/', meaning: 'Sụn', example: 'Cartilage protects the ends of bones at the joints.' },
          { word: 'Ligament', ipa: '/ˈlɪɡəmənt/', meaning: 'Dây chằng', example: 'A ligament connects bone to bone.' },
          { word: 'Bone Marrow', ipa: '/bəʊn ˈmærəʊ/', meaning: 'Tủy xương', example: 'Bone marrow produces red and white blood cells.' }
        ]
      },
      {
        branchName: 'Illnesses',
        words: [
          { word: 'Hypertension', ipa: '/ˌhaɪpərˈtenʃn/', meaning: 'Cao huyết áp', example: 'Hypertension is a major risk factor for heart disease.' },
          { word: 'Pneumonia', ipa: '/nuːˈməʊniə/', meaning: 'Viêm phổi', example: 'He was hospitalized with severe pneumonia.' },
          { word: 'Concussion', ipa: '/kənˈkʌʃn/', meaning: 'Chấn động não', example: 'The athlete suffered a concussion during the game.' },
          { word: 'Insomnia', ipa: '/ɪnˈsɑːmniə/', meaning: 'Chứng mất ngủ', example: 'Stress is a common cause of short-term insomnia.' },
          { word: 'Diabetes', ipa: '/ˌdaɪəˈbiːtiːz/', meaning: 'Bệnh tiểu đường', example: 'Diabetes requires careful monitoring of blood sugar levels.' },
          { word: 'Migraine', ipa: '/ˈmaɪɡreɪn/', meaning: 'Đau nửa đầu', example: 'A migraine can cause severe throbbing pain or a pulsing sensation.' },
          { word: 'Anemia', ipa: '/əˈniːmiə/', meaning: 'Bệnh thiếu máu', example: 'Iron deficiency is the most common cause of anemia.' }
        ]
      },
      {
        branchName: 'Medical Treatments',
        words: [
          { word: 'Anesthesia', ipa: '/ˌænəsˈθiːʒə/', meaning: 'Gây mê/Gây tê', example: 'The surgery was performed under general anesthesia.' },
          { word: 'Chemotherapy', ipa: '/ˌkiːməʊˈθerəpi/', meaning: 'Hóa trị', example: 'Chemotherapy is a common treatment for cancer.' },
          { word: 'Dialysis', ipa: '/daɪˈæləsɪs/', meaning: 'Chạy thận nhân tạo', example: 'Patients with kidney failure may require dialysis.' },
          { word: 'Vaccination', ipa: '/ˌvæksɪˈneɪʃn/', meaning: 'Tiêm chủng', example: 'Mass vaccination has eliminated several major diseases.' },
          { word: 'Prognosis', ipa: '/prɑːɡˈnəʊsɪs/', meaning: 'Tiên lượng', example: 'The doctor gave a positive prognosis after the treatment.' },
          { word: 'Rehabilitation', ipa: '/ˌriːəˌbɪlɪˈteɪʃn/', meaning: 'Phục hồi chức năng', example: 'He underwent months of cardiac rehabilitation.' },
          { word: 'Intravenous', ipa: '/ˌɪntrəˈviːnəs/', meaning: 'Tiêm tĩnh mạch', example: 'The patient received intravenous fluids to stay hydrated.' }
        ]
      }
    ]
  },
  {
    id: 'technology',
    topicName: 'Engineering & Tech',
    icon: '🚀',
    branches: [
      {
        branchName: 'Software',
        words: [
          { word: 'Back-end', ipa: '/ˈbæk end/', meaning: 'Hậu phương (Lô-gic hệ thống)', example: 'The back-end handles data storage and security.' },
          { word: 'Encryption', ipa: '/ɪnˈkrɪpʃn/', meaning: 'Mã hóa', example: 'Encryption protects user data from unauthorized access.' },
          { word: 'Artificial Intelligence', ipa: '/ˌɑːrtɪfɪʃl ɪnˈtelɪdʒəns/', meaning: 'Trí tuệ nhân tạo', example: 'AI is transforming many industries today.' },
          { word: 'Microservices', ipa: '/ˈmaɪkrəʊˌsɜːrvɪsɪz/', meaning: 'Kiến trúc vi dịch vụ', example: 'The application is built using a microservices architecture.' },
          { word: 'Latency', ipa: '/ˈleɪtənsi/', meaning: 'Độ trễ', example: 'Low latency is critical for online gaming and video calls.' },
          { word: 'Redundancy', ipa: '/rɪˈdʌndənsi/', meaning: 'Dữ liệu dư thừa/Dự phòng', example: 'Data redundancy ensures system reliability.' },
          { word: 'Scalability', ipa: '/ˌskeɪləˈbɪləti/', meaning: 'Khả năng mở rộng', example: 'Vite provides great scalability for large-scale projects.' }
        ]
      },
      {
        branchName: 'Hardware',
        words: [
          { word: 'Semiconductor', ipa: '/ˌsemikənˈdʌktər/', meaning: 'Chất bán dẫn', example: 'Semiconductors are essential components of modern electronics.' },
          { word: 'Circuit Board', ipa: '/ˈsɜːrkɪt bɔːrd/', meaning: 'Bảng mạch', example: 'The technician is soldering components onto the circuit board.' },
          { word: 'Transistor', ipa: '/trænˈzɪstər/', meaning: 'Bóng bán dẫn', example: 'Modern processors contain billions of transistors.' },
          { word: 'Firmware', ipa: '/ˈfɜːrmwer/', meaning: 'Phần sụn (Phần mềm hệ thống)', example: 'The device needs a firmware update to fix some bugs.' },
          { word: 'Peripheral', ipa: '/pəˈrɪfərəl/', meaning: 'Thiết bị ngoại vi', example: 'A keyboard and mouse are common computer peripherals.' },
          { word: 'Motherboard', ipa: '/ˈmʌðərbɔːrd/', meaning: 'Bo mạch chủ', example: 'The CPU is installed directly on the motherboard.' },
          { word: 'Voltage', ipa: '/ˈvəʊltɪdʒ/', meaning: 'Điện áp', example: 'Make sure the device supports the local voltage levels.' }
        ]
      },
      {
        branchName: 'Mechanical',
        words: [
          { word: 'Combustion Engine', ipa: '/kəmˈbʌstʃən ˈendʒɪn/', meaning: 'Động cơ đốt trong', example: 'Electric vehicles are replacing the internal combustion engine.' },
          { word: 'Thermodynamics', ipa: '/ˌθɜːrməʊdaɪˈnæmɪks/', meaning: 'Nhiệt động lực học', example: 'Thermodynamics describes the behavior of heat and energy.' },
          { word: 'Piston', ipa: '/ˈpɪstən/', meaning: 'Tông (Pít-tông)', example: 'The piston moves up and down within the cylinder.' },
          { word: 'Torque', ipa: '/tɔːrk/', meaning: 'Mô-men xoắn', example: 'This truck engine produces significant torque at low RPM.' },
          { word: 'Hydraulics', ipa: '/haɪˈdrɔːlɪks/', meaning: 'Thủy lực học', example: 'Heavy machinery often uses hydraulics for lifting.' },
          { word: 'Aerodynamics', ipa: '/ˌerəʊdaɪˈnæmɪks/', meaning: 'Khí động lực học', example: 'The car design was optimized for better aerodynamics.' },
          { word: 'Friction', ipa: '/ˈfrɪkʃn/', meaning: 'Lực ma sát', example: 'Lubrication is used to reduce friction between moving parts.' }
        ]
      },
      {
        branchName: 'Civil Engineering',
        words: [
          { word: 'Infrastructure', ipa: '/ˈɪnfrəstrʌktʃər/', meaning: 'Cơ sở hạ tầng', example: 'The government is investing heavily in local infrastructure.' },
          { word: 'Blueprint', ipa: '/ˈbluːprɪnt/', meaning: 'Bản thiết kế/Sơ đồ', example: 'Constructors must strictly follow the architectural blueprints.' },
          { word: 'Suspension Bridge', ipa: '/səˈspenʃn brɪdʒ/', meaning: 'Cầu treo', example: 'The Golden Gate Bridge is a famous suspension bridge.' },
          { word: 'Reinforced Concrete', ipa: '/ˌriːɪnfɔːrst ˈkɑːnkriːt/', meaning: 'Bê tông cốt thép', example: 'Most modern skyscrapers use reinforced concrete.' },
          { word: 'Foundation', ipa: '/faʊnˈdeɪʃn/', meaning: 'Móng nhà', example: 'A solid foundation is essential for building stability.' },
          { word: 'Urban Planning', ipa: '/ˈɜːrbən ˈplænɪŋ/', meaning: 'Quy hoạch đô thị', example: 'Urban planning aims to create sustainable city environments.' },
          { word: 'Arch', ipa: '/ɑːrtʃ/', meaning: 'Hình cung/Vòm', example: 'The ancient Roman aqueducts used arches for support.' }
        ]
      }
    ]
  }
];
