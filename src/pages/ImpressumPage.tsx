import { LegalLayout } from '../components/LegalLayout';

export default function ImpressumPage() {
  return (
    <LegalLayout title="Impressum">
      <p>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</p>
      <p>
        <strong>Anke Siebel</strong><br />
        Musterstraße 1<br />
        12345 Musterstadt<br />
      </p>
      <p>
        Telefon: +49 (0) 123 456 789<br />
        E-Mail: kontakt@anke-siebel.de
      </p>
      <h3>Haftungsausschluss (Disclaimer)</h3>
      <p>
        <strong>Haftung für Inhalte</strong><br />
        Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
      </p>
    </LegalLayout>
  );
}
