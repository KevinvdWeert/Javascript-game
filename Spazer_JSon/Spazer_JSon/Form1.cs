using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Windows.Forms;

namespace Spazer_JSon
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void btnOpenJson_Click(object sender, EventArgs e)
        {
            // Open dialoog om JSON te kiezen
            OpenFileDialog openFileDialog = new OpenFileDialog
            {
                Filter = "JSON bestanden (*.json)|*.json|Alle bestanden (*.*)|*.*",
                Title = "Kies een JSON-bestand"
            };

            if (openFileDialog.ShowDialog() == DialogResult.OK)
            {
                try
                {
                    string bestandPad = openFileDialog.FileName;
                    string json = File.ReadAllText(bestandPad);

                    // JSON deserialiseren
                    List<Speler> spelers = JsonConvert.DeserializeObject<List<Speler>>(json);

                    // DataGridView vullen
                    dataGridView1.DataSource = spelers;
                    dataGridView1.AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill;
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Fout bij het inladen van JSON: {ex.Message}", "Fout", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
        }
    }

    // 📘 De klasse hoort buiten de Form-class te staan (of bovenaan binnen hetzelfde bestand)
    public class Speler
    {
        public string naam { get; set; }
        public int score { get; set; }
    }
}
