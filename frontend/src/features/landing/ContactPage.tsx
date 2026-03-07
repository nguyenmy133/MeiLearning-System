import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ContactSection } from "./components/ContactSection";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function ContactPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24">
        {/* Hero */}
        <section className="section-padding bg-accent/30">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-primary font-medium text-sm uppercase tracking-wider mb-4 block">
                Liên hệ
              </span>
              <h1 className="text-4xl lg:text-5xl font-display font-bold mb-6">
                Liên hệ với chúng tôi
              </h1>
              <p className="text-lg text-muted-foreground">
                Chúng tôi luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của bạn
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="section-padding">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {[
                {
                  icon: MapPin,
                  title: "Địa chỉ",
                  content: "123 Đường ABC, Quận XYZ, TP.HCM"
                },
                {
                  icon: Phone,
                  title: "Hotline",
                  content: import.meta.env.VITE_HOTLINE 
                },
                {
                  icon: Mail,
                  title: "Email",
                  content: "contact@educenter.vn"
                },
                {
                  icon: Clock,
                  title: "Giờ làm việc",
                  content: "8h - 21h (T2 - CN)"
                }
              ].map((item) => (
                <div key={item.title} className="text-center p-6 rounded-2xl bg-card border border-border">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.content}</p>
                </div>
              ))}
            </div>

            {/* Map placeholder + Form */}
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="rounded-2xl overflow-hidden bg-muted h-[400px] flex items-center justify-center">
                <div className="text-center p-8">
                  <MapPin className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Bản đồ vị trí trung tâm<br />
                    (Tích hợp Google Maps)
                  </p>
                </div>
              </div>
              
              <div className="bg-accent/50 rounded-2xl p-8 border border-border">
                <h2 className="text-2xl font-display font-bold mb-6">Gửi tin nhắn cho chúng tôi</h2>
                <ContactSection />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
