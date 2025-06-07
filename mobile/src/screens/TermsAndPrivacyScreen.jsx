import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAnalytics } from '../utils/analytics';

export default function TermsAndPrivacyScreen() {
  const navigation = useNavigation();
  const { trackScreenView, trackTap, trackAppEvent, isAuthenticated } = useAnalytics();

  useEffect(() => {
    const init = async () => {
      if (await isAuthenticated()) {
        trackScreenView('TermsAndPrivacy', {
          timestamp: new Date().toISOString()
        });
      }
    };
    init();
  }, []);

  const handleEmailPress = () => {
    trackTap('contact_email', { source: 'terms_screen' });
    Linking.openURL('mailto:teamcheckafe@gmail.com');
  };

  const sections = [
    {
      title: "Điều Khoản Dịch Vụ",
      content: "Điều khoản sử dụng của ứng dụng Checkafe – ứng dụng đặt chỗ quán cà phê.",
      isHeader: true
    },
    {
      title: "Chính sách quyền riêng tư của ứng dụng Checkafe",
      content: "Checkafe tôn trọng và bảo vệ quyền riêng tư của khách hàng. Chính sách quyền riêng tư này nhằm giải thích cách chúng tôi thu thập, sử dụng, chia sẻ và bảo vệ thông tin cá nhân của bạn khi bạn sử dụng ứng dụng đặt chỗ quán cà phê Checkafe (sau đây gọi là \"Ứng dụng\"). Bằng cách sử dụng Ứng dụng, bạn đồng ý với các điều khoản và điều kiện của chính sách quyền riêng tư này."
    },
    {
      title: "Thông tin cá nhân mà chúng tôi thu thập",
      content: "Khi bạn đăng ký và sử dụng Ứng dụng, chúng tôi có thể yêu cầu bạn cung cấp một số thông tin cá nhân, bao gồm:",
      items: [
        "Họ và tên",
        "Số điện thoại", 
        "Địa chỉ email",
        "Ngày sinh",
        "Giới tính",
        "Ảnh đại diện"
      ],
      additionalContent: "Chúng tôi cũng có thể thu thập thông tin về cách bạn sử dụng Ứng dụng, bao gồm:",
      additionalItems: [
        "Lịch sử đặt chỗ",
        "Số điểm tích lũy (nếu có chương trình thưởng)",
        "Sở thích và lựa chọn quán cà phê của bạn"
      ]
    },
    {
      title: "Mục đích thu thập thông tin cá nhân",
      content: "Chúng tôi thu thập thông tin cá nhân của bạn với các mục đích sau:",
      items: [
        "Để xác minh danh tính và tài khoản của bạn",
        "Để cung cấp cho bạn các tính năng và dịch vụ của Ứng dụng",
        "Để nâng cao chất lượng và trải nghiệm của bạn khi sử dụng Ứng dụng",
        "Để gửi cho bạn các thông báo, tin tức, khuyến mãi và ưu đãi liên quan đến Ứng dụng và các đối tác quán cà phê",
        "Để phân tích hành vi và xu hướng sử dụng nhằm cải thiện Ứng dụng và sản phẩm của Checkafe",
        "Để tuân thủ các quy định pháp luật có liên quan"
      ]
    },
    {
      title: "Cách chúng tôi chia sẻ thông tin cá nhân", 
      content: "Chúng tôi không bán, cho thuê hoặc chuyển nhượng thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào mà không có sự đồng ý của bạn. Chúng tôi chỉ chia sẻ thông tin cá nhân của bạn với các bên sau:",
      items: [
        "Các đối tác, nhà cung cấp hoặc nhà thầu của chúng tôi, để hỗ trợ chúng tôi trong việc cung cấp dịch vụ Ứng dụng và các dịch vụ liên quan",
        "Các cơ quan nhà nước hoặc pháp luật, khi được yêu cầu theo quy định của pháp luật hoặc để bảo vệ quyền lợi hợp pháp của chúng tôi hoặc người khác",
        "Các bên liên quan trong trường hợp chúng tôi tham gia vào một giao dịch kinh doanh như sáp nhập, mua bán hoặc thoái vốn"
      ]
    },
    {
      title: "Cách chúng tôi bảo vệ thông tin cá nhân",
      content: "Chúng tôi sử dụng các biện pháp kỹ thuật, hành chính và vật lý hợp lý để bảo vệ thông tin cá nhân của bạn khỏi truy cập, sử dụng hoặc tiết lộ trái phép. Tuy nhiên, bạn cũng nên thực hiện các bước cần thiết để bảo vệ thông tin cá nhân của mình, bao gồm:",
      items: [
        "Không chia sẻ mật khẩu hoặc thông tin đăng nhập của bạn với bất kỳ ai",
        "Đăng xuất khỏi Ứng dụng khi không sử dụng",
        "Cập nhật Ứng dụng lên phiên bản mới nhất",
        "Sử dụng các phần mềm chống vi-rút và bảo mật trên thiết bị của bạn"
      ]
    },
    {
      title: "Quyền và trách nhiệm của bạn",
      content: "Bạn có quyền truy cập, sửa đổi, xóa hoặc yêu cầu ngừng sử dụng thông tin cá nhân của mình bằng cách liên hệ với chúng tôi qua email teamcheckafe@gmail.com. Chúng tôi sẽ xử lý yêu cầu của bạn trong thời gian sớm nhất có thể, trừ khi việc làm đó vi phạm các quy định pháp luật hoặc ảnh hưởng đến quyền lợi hợp pháp của chúng tôi.\n\nBạn có trách nhiệm cung cấp thông tin cá nhân chính xác, đầy đủ và cập nhật khi sử dụng Ứng dụng. Bạn cũng có trách nhiệm tuân thủ các điều khoản và điều kiện sử dụng Ứng dụng và các quy định pháp luật liên quan."
    },
    {
      title: "Thay đổi chính sách quyền riêng tư",
      content: "Chúng tôi có thể thay đổi chính sách quyền riêng tư này theo thời gian để phù hợp với các hoạt động kinh doanh và yêu cầu pháp luật. Khi có thay đổi, chúng tôi sẽ thông báo cho bạn qua Ứng dụng hoặc email. Bằng cách tiếp tục sử dụng Ứng dụng sau khi có thông báo, bạn đồng ý với các thay đổi đó."
    },
    {
      title: "Liên hệ với chúng tôi",
      content: "Nếu bạn có bất kỳ câu hỏi, ý kiến hoặc khiếu nại về chính sách quyền riêng tư này hoặc cách chúng tôi xử lý thông tin cá nhân của bạn, vui lòng liên hệ với chúng tôi theo địa chỉ email teamcheckafe@gmail.com. Chúng tôi sẽ cố gắng giải quyết mọi vấn đề một cách nhanh chóng và hiệu quả."
    }
  ];

  const renderSection = (section, index) => (
    <View key={index} style={[styles.section, section.isHeader && styles.headerSection]}>
      <Text style={[styles.sectionTitle, section.isHeader && styles.headerTitle]}>
        {section.title}
      </Text>
      
      {section.content && (
        <Text style={[styles.sectionContent, section.isHeader && styles.headerContent]}>
          {section.content}
        </Text>
      )}
      
      {section.items && (
        <View style={styles.itemsContainer}>
          {section.items.map((item, itemIndex) => (
            <View key={itemIndex} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>
      )}
      
      {section.additionalContent && (
        <Text style={styles.additionalContent}>
          {section.additionalContent}
        </Text>
      )}
      
      {section.additionalItems && (
        <View style={styles.itemsContainer}>
          {section.additionalItems.map((item, itemIndex) => (
            <View key={itemIndex} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            trackTap('back_button', { source: 'terms_screen' });
            navigation.goBack();
          }}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#7a5545" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Điều khoản & Bảo mật</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sections.map((section, index) => renderSection(section, index))}
        
        {/* Contact Section */}
        <View style={styles.contactSection}>
          <View style={styles.contactCard}>
            <MaterialCommunityIcons name="email-outline" size={24} color="#7a5545" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Liên hệ hỗ trợ</Text>
              <TouchableOpacity onPress={handleEmailPress}>
                <Text style={styles.contactEmail}>teamcheckafe@gmail.com</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
          </Text>
          <Text style={styles.footerText}>
            © 2024 Checkafe. Tất cả quyền được bảo lưu.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2D2D',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerSection: {
    backgroundColor: '#7a5545',
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 12,
    lineHeight: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center',
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4A4A4A',
    textAlign: 'justify',
  },
  headerContent: {
    color: '#F0F0F0',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '400',
  },
  itemsContainer: {
    marginTop: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#7a5545',
    marginRight: 8,
    marginTop: 2,
    fontWeight: 'bold',
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#4A4A4A',
  },
  additionalContent: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4A4A4A',
    marginTop: 16,
    marginBottom: 4,
    textAlign: 'justify',
  },
  contactSection: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#7a5545',
  },
  contactInfo: {
    marginLeft: 16,
    flex: 1,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: 4,
  },
  contactEmail: {
    fontSize: 15,
    color: '#7a5545',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  footer: {
    marginHorizontal: 16,
    marginTop: 32,
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#8A8A8A',
    textAlign: 'center',
    marginBottom: 4,
  },
}); 