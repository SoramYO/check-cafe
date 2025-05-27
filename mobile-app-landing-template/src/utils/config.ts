import type { TemplateConfig } from "./configType";

const templateConfig: TemplateConfig = {
  name: "ChecKafe",
  seo: {
    title: "ChecKafe - Ứng dụng đặt chỗ quán cà phê Đà Lạt | Đặt chỗ dễ dàng - Check-in chất lừ",
    description: "ChecKafe - Ứng dụng đặt chỗ trực tiếp tại các quán cà phê đẹp nhất Đà Lạt. Khám phá quán theo phong cách, đặt chỗ trước, check-in nhận điểm thưởng. Tải ngay để trải nghiệm!",
    keywords: "đặt chỗ quán cà phê, quán cà phê đà lạt, check-in đà lạt, đặt chỗ trực tuyến, quán cà phê view đẹp, quán cà phê vintage, quán cà phê hàn quốc, pet friendly cafe",
    ogImage: "/og-image.jpg",
    ogType: "website",
    ogUrl: "https://checkafe.com",
    twitterCard: "summary_large_image",
    twitterSite: "@checkafe",
    twitterCreator: "@checkafe",
  },
  // Draws grid behind main container
  backgroundGrid: false,
  logo: "/logo.png",
  theme: "coffee",
  // Forces theme to be chosen above, no matter what user prefers
  forceTheme: false,
  // Shows switch to toggle between dark and light modes
  showThemeSwitch: false,
  appStoreLink: "https://apps.apple.com/us/app/google/id284815942",
  googlePlayLink:
    "https://play.google.com/store/apps/details?id=com.google.android.googlequicksearchbox",
  footer: {
    legalLinks: {
      termsAndConditions: true,
      cookiesPolicy: true,
      privacyPolicy: true,
    },
    socials: {
      instagram: "https://instagram.com/google",
      facebook: "https://facebook.com/google",
      twitter: "https://x.com/google",
    },
    links: [
      { href: "/#features", title: "Các tính năng chính" },
      { href: "/#how-it-works", title: "Cách hoạt động" },
      { href: "/#pricing", title: "Bảng giá" },
      { href: "/#faq", title: "FAQ" },
    ],
  },
  topNavbar: {
    cta: "Tải ứng dụng ngay",
    disableWidthAnimation: false,
    hideAppStore: false,
    hideGooglePlay: false,
    links: [
      { href: "/#features", title: "Tính năng chính" },
      { href: "/#how-it-works", title: "Cách hoạt động" },
      { href: "/#pricing", title: "Bảng giá" },
      { href: "/#faq", title: "Câu hỏi thường gặp" },
    ],
  },
  appBanner: {
    id: "app-banner",
    title: "Tải ứng dụng ngay hôm nay",
    subtitle:
      "Khám phá và đặt chỗ trực tiếp tại các quán cà phê đẹp nhất Đà Lạt với Checkafe",
    screenshots: [
      "/screenshots/1.webp",
      "/screenshots/2.webp",
      "/screenshots/3.webp",
    ],
  },
  home: {
    seo: {
      title: "Mobile App Landing Template",
      description: "Mobile App Landing Template",
    },
    testimonials: {
      id: "testimonials",
      title: "Đánh giá người dùng",
      subtitle: "Xem một số đánh giá từ người dùng",
      cards: [
        {
          name: "Xuân Thành",
          comment:
            "Dịch vụ tuyệt vời! Đặt chỗ rất dễ dàng và quán đúng như mô tả. Mọi thứ được xử lý nhanh chóng và chuyên nghiệp. Mình sẽ tiếp tục sử dụng Checkafe khi quay lại Đà Lạt.",
        },
        {
          name: "Hữu Sơn",
          comment:
            "Trải nghiệm rất hài lòng! Ứng dụng dễ dùng, đặt được chỗ trước nên không phải xếp hàng. Đánh giá và hình ảnh giúp mình chọn đúng quán hợp gu. Rất đáng thử!",
        },
        {
          name: "Huy Hoàng",
          comment:
            "Từ lúc đăng ký đến khi check-in đều rất mượt mà. Mình cảm thấy được chăm sóc như khách quen. Quán được gợi ý rất đúng sở thích. Quá tuyệt!",
        },
        {
          name: "Anh Tú",
          comment:
            "Ứng dụng có giao diện thân thiện và thông tin chi tiết. Mình rất ấn tượng với hệ thống tích điểm và ưu đãi riêng cho từng quán. Rất tiện lợi và tiết kiệm.",
        },
        {
          name: "Minh Anh",
          comment:
            "Không thể hài lòng hơn! Ứng dụng hỗ trợ tận tình, chọn quán dễ, check-in nhanh. Mình còn đổi được quà sau khi tích điểm. Rất đáng dùng!",
        },
      ]
      
    },
    partners: {
      title: "Website: https://checkafe.com",
      logos: [
        // "/misc/companies/apple.svg",
        // "/misc/companies/aws.svg",
        // "/misc/companies/google.svg",
        // "/misc/companies/tumblr.svg",
      ],
    },
    howItWorks: {
      id: "how-it-works",
      title: "Cách hoạt động",
      subtitle: "Trải nghiệm Checkafe chỉ với 5 bước đơn giản",
      steps: [
        {
          title: "Tải app Checkafe",
          subtitle: "Tải app Checkafe từ App Store hoặc Google Play",
          image: "/stock/01.webp",
        },
        {
          title: "Đăng ký tài khoản",
          subtitle: "Đăng ký tài khoản, lựa chọn sở thích",
          image: "/stock/02.webp",
        },
        {
          title: "Khám phá quán",
          subtitle: "Khám phá danh sách quán theo phong cách, vị trí hoặc đề xu hướng",
          image: "/stock/03.webp",
        },
        {
          title: "Đặt chỗ trước",
          subtitle: "Đặt chỗ trước ngay trên app",
          image: "/stock/04.webp",
        },
        {
          title: "Check-in và trải nghiệm",
          subtitle: "Check-in và trải nghiệm, nhận điểm và review lại quán",
          image: "/stock/05.webp",
        },
      ],
    },
    features: {
      id: "features",
      title: "Nâng cao trải nghiệm cà phê của bạn",
      subtitle:
        "Khám phá và trải nghiệm những quán cà phê đẹp nhất Đà Lạt với Checkafe",
      cards: [
        {
          title: "Khám phá quán theo phong cách",
          subtitle:
            "Xem danh sách quán theo chủ đề: View rừng, Vintage, Hàn Quốc, Pet-friendly...",
          icon: "/3D/link-front-color.webp",
        },
        {
          title: "Đặt chỗ trực tuyến",
          subtitle:
            "Đặt trước khu check-in yêu thích, không cần xếp hàng.",
          icon: "/3D/clock-front-color.webp",
        },
        {
          title: "Xem ảnh thật, review thật",
          subtitle:
            "Cập nhật hình ảnh và đánh giá từ người dùng đã trải nghiệm.",
          icon: "/3D/roll-brush-front-color.webp",
        },
        {
          title: "Check-in nhận điểm thưởng",
          subtitle:
            "Mỗi lần check-in nhận ngay điểm tích luũy đổi quà hoặc ưu đãi.",
          icon: "/3D/sheild-front-color.webp",
        },
      ],
    },
    faq: {
      id: "faq",
      title: "FAQ",
      qa: [
        {
          question: "Checkafe có miễn phí không?",
          answer:
            "Có, người dùng có thể sử dụng miễn phí và check-in để nhận ưu đãi.",
        },
        {
          question: "Quán có phải đăng ký gói VIP không?",
          answer:
            "Không bắt buộc, nhưng gói VIP sẽ giúp quán nổi bật hơn, tăng tỷ lệ đặt.",
        },
        {
          question: "Điểm thưởng có đổi quà được không?",
          answer:
            "Có, bạn có thể tích luũy và đổi quà ngay trong app.",
        },
        {
          question: "Checkafe hoạt động ở những thành phố nào?",
          answer:
            "Hiện tại chúng tôi tập trung tại Đà Lạt, sẽ mở rộng sang Hội An, Sapa...",
        },
      ],
    },
    header: {
      headline: "Đặt chỗ dễ dàng – Check-in   chất lừ!",
      subtitle:
        "Checkafe là ứng dụng thông minh giúp bạn khám phá và đặt chỗ trước tại các quán cà phê đẹp nhất Đà Lạt. Từ những quán hot trend đến những điểm check-in ít người biết, Checkafe giúp bạn tìm quán, đặt chỗ và trải nghiệm dễ dàng.",
      screenshots: [
        "/screenshots/1.webp",
        "/screenshots/2.webp",
        "/screenshots/3.webp",
      ],
      rewards: ["Tín đồ check-in", "Trải nghiệm đặc biệt"],
      usersDescription: "100+ người đã sử dụng ứng dụng",
      headlineMark: [5],
    },
    pricing: {
      id: "pricing",
      title: "Bảng giá",
      subtitle: "Lựa chọn gói dịch vụ phù hợp với nhu cầu của bạn",
      actionText: "Tải ứng dụng ngay",
      plans: [
        {
          title: "Người dùng phổ thông",
          price: "Miễn phí",
          rows: ["Sử dụng miễn phí", "Check-in nhận ưu đãi", "Xem review và đánh giá"],
        },
        {
          title: "Gói VIP dành cho quán",
          price: "Liên hệ",
          featured: true,
          rows: [
            "Hiển thị nổi bật trên app",
            "Tạo ưu đãi, quảng cáo trên trang chủ",
            "Nhận báo cáo chi tiết lượt xem/đặt",
            "Góp phần gia tăng doanh thu 30-50%",
          ],
        },
      ],
    },
  },
  privacyPolicy: {
    seo: {
      title: "Chính sách quyền riêng tư - ChecKafe App",
      description: "Tìm hiểu cách ChecKafe thu thập và sử dụng dữ liệu cá nhân của bạn.",
    },
    content: `# Chính Sách Quyền Riêng Tư
  
  **Ngày hiệu lực:** 01/06/2025
  
  Chúng tôi, đội ngũ phát triển ChecKafe, cam kết bảo vệ thông tin cá nhân của bạn khi sử dụng ứng dụng và trang web của chúng tôi.
  
  ## 1. Thông tin chúng tôi thu thập
  - Thông tin cá nhân: Họ tên, email, số điện thoại.
  - Dữ liệu sử dụng: Lịch sử tìm kiếm, đặt chỗ, lượt check-in.
  
  ## 2. Mục đích sử dụng
  - Cung cấp và cải thiện trải nghiệm sử dụng ứng dụng.
  - Gợi ý quán phù hợp và hiển thị ưu đãi cá nhân hóa.
  - Liên hệ hỗ trợ khi cần thiết.
  
  ## 3. Bảo mật
  Chúng tôi áp dụng các biện pháp bảo mật tiên tiến để bảo vệ dữ liệu người dùng, bao gồm mã hóa và xác thực 2 lớp.
  
  ## 4. Quyền của bạn
  Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa thông tin cá nhân bất cứ lúc nào bằng cách liên hệ đội ngũ hỗ trợ ChecKafe.
  
  Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ chúng tôi tại support@checkafe.com.
  `,
  },  
  cookiesPolicy: {
    seo: {
      title: "Chính sách Cookie - ChecKafe App",
      description: "Tìm hiểu cách ChecKafe sử dụng cookie để nâng cao trải nghiệm người dùng.",
    },
    content: `# Chính Sách Cookie
  
  **Ngày hiệu lực:** 01/06/2025
  
  Ứng dụng và website ChecKafe sử dụng cookie để cá nhân hóa trải nghiệm của bạn.
  
  ## 1. Cookie là gì?
  Cookie là các tệp nhỏ được lưu trên thiết bị của bạn để lưu lại thông tin về phiên làm việc.
  
  ## 2. Chúng tôi sử dụng cookie để:
  - Ghi nhớ lựa chọn và ngôn ngữ của bạn.
  - Phân tích hành vi người dùng để cải thiện dịch vụ.
  - Cung cấp nội dung và ưu đãi phù hợp.
  
  ## 3. Quản lý cookie
  Bạn có thể vô hiệu hóa cookie trong trình duyệt, nhưng một số tính năng có thể bị hạn chế.
  
  Nếu có thắc mắc, vui lòng liên hệ với đội ngũ ChecKafe qua email: support@checkafe.com.
  `,
  },  
  termsAndConditions: {
    seo: {
      title: "Điều khoản sử dụng - ChecKafe App",
      description: "Vui lòng đọc kỹ điều khoản sử dụng dịch vụ của ChecKafe.",
    },
    content: `# Điều Khoản Sử Dụng
  
  **Ngày hiệu lực:** 01/06/2025
  
  Việc sử dụng ứng dụng ChecKafe đồng nghĩa với việc bạn đồng ý với các điều khoản sau:
  
  ## 1. Sử dụng dịch vụ
  - Người dùng phải cung cấp thông tin chính xác và chịu trách nhiệm về các hành động trên tài khoản của mình.
  - Cấm mọi hành vi gian lận hoặc lợi dụng hệ thống tích điểm.
  
  ## 2. Trách nhiệm
  ChecKafe không chịu trách nhiệm về các vấn đề phát sinh từ phía quán, nhưng sẽ hỗ trợ giải quyết nếu nhận được khiếu nại.
  
  ## 3. Sở hữu trí tuệ
  Mọi nội dung và thiết kế trong ứng dụng thuộc quyền sở hữu của đội ngũ phát triển ChecKafe.
  
  ## 4. Thay đổi điều khoản
  Chúng tôi có thể cập nhật điều khoản khi cần thiết. Mọi thay đổi sẽ được thông báo trong ứng dụng.
  
  Nếu có câu hỏi, hãy liên hệ với đội ngũ ChecKafe tại support@checkafe.com.
  `,
  },
  
};

export default templateConfig;
