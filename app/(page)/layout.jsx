import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";

export default function Layout({ children }) {
    return (
        <main>
            <Header />
            {children}
            <Footer />
        </main>
    )
}