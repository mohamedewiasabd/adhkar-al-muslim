Name:           adhkar-al-muslim
Version:        1.9.16
Release:        1
Summary:        أذكار المسلم - الورد اليومي (Muslim Athkar - Daily Wird)
License:        Proprietary
Url:            https://github.com/mohamedewiasabd/adhkar-al-muslim
Group:          Productivity/Miscellaneous
Source:         adhkar-al-muslim-v%{version}.tar.gz
BuildRequires:  nodejs >= 20
BuildRequires:  npm
BuildRequires:  rust >= 1.77
BuildRequires:  cargo
BuildRequires:  pkgconfig(webkit2gtk-4.1)
BuildRequires:  pkgconfig(gtk+-3.0)
BuildRequires:  pkgconfig(libsoup-3.0)
BuildRequires:  pkgconfig(ayatana-appindicator3-0.1)
BuildRequires:  pkgconfig(librsvg-2.0)
Requires:       libwebkit2gtk-4_1-0
Requires:       gtk3
Requires:       librsvg2

%description
أذكار المسلم - الورد اليومي. تطبيق متكامل يجمع الأذكار والأدعية
المأثورة وأسماء الله الحسنى والقرآن والمسبحة ومواقيت الصلاة،
يعمل دون اتصال، مبني بمحرك Tauri 2.

%prep
%setup -q

%build
export HOME=/tmp
npm ci --no-audit --no-fund
npm run build
cd src-tauri
cargo build --release --locked
cd ..

%install
install -Dm755 src-tauri/target/release/adhkar-al-muslim %{buildroot}%{_bindir}/adhkar-al-muslim
install -Dm644 packaging/flatpak/com.muslim.adhkar.wird.desktop %{buildroot}%{_datadir}/applications/com.muslim.adhkar.wird.desktop
install -Dm644 src-tauri/icons/128x128.png %{buildroot}%{_datadir}/icons/hicolor/128x128/apps/com.muslim.adhkar.wird.png
install -Dm644 packaging/flatpak/com.muslim.adhkar.wird.metainfo.xml %{buildroot}%{_datadir}/metainfo/com.muslim.adhkar.wird.metainfo.xml

%files
%{_bindir}/adhkar-al-muslim
%{_datadir}/applications/com.muslim.adhkar.wird.desktop
%{_datadir}/icons/hicolor/128x128/apps/com.muslim.adhkar.wird.png
%{_datadir}/metainfo/com.muslim.adhkar.wird.metainfo.xml

%changelog
* Fri Sep 25 2026 Mohamed Ewias Abd <mohamedewiasabd@gmail.com> - 1.9.16-1
- إصدار تلقائي 1.9.16.