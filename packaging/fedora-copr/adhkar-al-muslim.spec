Name:           adhkar-al-muslim
Version:        1.9.16
Release:        1%{?dist}
Summary:        أذكار المسلم - الورد اليومي (Muslim Athkar - Daily Wird)
License:        Proprietary
URL:            https://github.com/mohamedewiasabd/adhkar-al-muslim
Source0:        %{name}-v%{version}.tar.gz
Source1:        com.muslim.adhkar.wird.desktop

BuildRequires:  nodejs >= 20
BuildRequires:  npm
BuildRequires:  rust >= 1.77
BuildRequires:  cargo
BuildRequires:  pkgconfig(webkit2gtk-4.1)
BuildRequires:  pkgconfig(gtk+-3.0)
BuildRequires:  pkgconfig(libsoup-3.0)
BuildRequires:  pkgconfig(ayatana-appindicator3-0.1)
BuildRequires:  pkgconfig(librsvg-2.0)

Requires:       webkit2gtk4.1
Requires:       gtk3
Requires:       librsvg2

%description
أذكار المسلم - الورد اليومي. تطبيق متكامل يجمع أذكار الصباح والمساء،
أدعية مأثورة، أسماء الله الحسنى، الرقية الشرعية، القرآن، مسبحة،
مواقيت الصلاة والورد اليومي. يعمل دون اتصال. مبني بمحرك Tauri 2.

%prep
%setup -q
%{__mkdir_p} binaries 2>/dev/null || :

%build
export HOME=/builddir
npm ci --no-audit --no-fund
npm run build
cd src-tauri
cargo build --release --locked
cd ..

%install
rm -rf %{buildroot}
install -Dm755 src-tauri/target/release/adhkar-al-muslim %{buildroot}%{_bindir}/adhkar-al-muslim
install -Dm644 %{SOURCE1} %{buildroot}%{_datadir}/applications/com.muslim.adhkar.wird.desktop
install -Dm644 src-tauri/icons/128x128.png %{buildroot}%{_datadir}/icons/hicolor/128x128/apps/com.muslim.adhkar.wird.png
install -Dm644 src-tauri/icons/128x128@2x.png %{buildroot}%{_datadir}/icons/hicolor/256x256/apps/com.muslim.adhkar.wird.png
install -Dm644 packaging/flatpak/com.muslim.adhkar.wird.metainfo.xml %{buildroot}%{_datadir}/metainfo/com.muslim.adhkar.wird.metainfo.xml

%post
touch --no-create %{_datadir}/icons/hicolor &>/dev/null || :
gtk-update-icon-cache %{_datadir}/icons/hicolor &>/dev/null || :

%files
%{_bindir}/adhkar-al-muslim
%{_datadir}/applications/com.muslim.adhkar.wird.desktop
%{_datadir}/icons/hicolor/128x128/apps/com.muslim.adhkar.wird.png
%{_datadir}/icons/hicolor/256x256/apps/com.muslim.adhkar.wird.png
%{_datadir}/metainfo/com.muslim.adhkar.wird.metainfo.xml

%changelog
* Fri Sep 25 2026 Mohamed Ewias Abd <mohamedewiasabd@gmail.com> - 1.9.16-1
- إصدار تلقائي 1.9.16.